import { v4 as uuidv4 } from 'uuid';
import { NavigationEngine } from './navigationEngine';
import {
  DiagnosticsSnapshot,
  GnssFix,
  ImuSample,
  RoadAnomalyEvent,
  SessionDetail,
  SessionSummary,
  VehicleState,
} from '../types/navigation';
import { saveSessionDetail } from '../services/sessionStore';
import { DIAGNOSTICS_BROADCAST_INTERVAL_MS } from '../config/constants';

interface ActiveSession {
  id: string;
  engine: NavigationEngine;
  startedAt: number;
  track: VehicleState[];
  broadcastTimer: ReturnType<typeof setInterval> | null;
}

type SnapshotListener = (snapshot: DiagnosticsSnapshot) => void;
type AnomalyListener = (anomaly: RoadAnomalyEvent) => void;

/**
 * Owns the set of currently-live NavigationEngines — one per connected
 * device/session — plus the periodic diagnostics-broadcast loop. This is
 * the glue between the transport layer (WebSocket: raw device frames in,
 * diagnostics snapshots out) and the pure NavigationEngine math, so the
 * engine itself never has to know about sockets, timers, or persistence.
 */
export class SessionManager {
  private sessions = new Map<string, ActiveSession>();
  private snapshotListeners = new Map<string, Set<SnapshotListener>>();
  private anomalyListeners = new Map<string, Set<AnomalyListener>>();

  /** Start (or resume tracking, if already active) a session. Returns the session id. */
  startSession(sessionId: string = uuidv4()): string {
    if (this.sessions.has(sessionId)) return sessionId;

    const session: ActiveSession = {
      id: sessionId,
      engine: new NavigationEngine(),
      startedAt: Date.now(),
      track: [],
      broadcastTimer: null,
    };

    session.broadcastTimer = setInterval(() => {
      const snapshot = session.engine.buildSnapshot(sessionId, Date.now());
      session.track.push(snapshot.vehicleState);
      this.emitSnapshot(sessionId, snapshot);
    }, DIAGNOSTICS_BROADCAST_INTERVAL_MS);

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  ingestImu(sessionId: string, sample: ImuSample): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    const anomaly = session.engine.processImu(sample);
    if (anomaly) this.emitAnomaly(sessionId, anomaly);
  }

  ingestGnss(sessionId: string, fix: GnssFix): void {
    this.sessions.get(sessionId)?.engine.processGnss(fix);
  }

  setOutageSimulated(sessionId: string, enabled: boolean): void {
    this.sessions.get(sessionId)?.engine.setOutageSimulated(enabled);
  }

  /** On-demand snapshot, e.g. for a REST poll fallback if a client can't hold a WebSocket open. */
  getSnapshot(sessionId: string): DiagnosticsSnapshot | null {
    const session = this.sessions.get(sessionId);
    return session ? session.engine.buildSnapshot(sessionId, Date.now()) : null;
  }

  async stopSession(sessionId: string): Promise<SessionSummary | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (session.broadcastTimer) clearInterval(session.broadcastTimer);

    const stats = session.engine.getSummaryStats();
    const summary: SessionSummary = {
      id: sessionId,
      startedAt: session.startedAt,
      endedAt: Date.now(),
      distanceMeters: stats.distanceMeters,
      anomalyCount: stats.anomalyCount,
      avgConfidenceScore: stats.avgConfidenceScore,
    };
    const detail: SessionDetail = {
      ...summary,
      track: session.track,
      anomalies: session.engine.getAllAnomalies(),
    };

    await saveSessionDetail(detail);

    this.sessions.delete(sessionId);
    this.snapshotListeners.delete(sessionId);
    this.anomalyListeners.delete(sessionId);

    return summary;
  }

  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  onSnapshot(sessionId: string, listener: SnapshotListener): () => void {
    if (!this.snapshotListeners.has(sessionId)) this.snapshotListeners.set(sessionId, new Set());
    this.snapshotListeners.get(sessionId)!.add(listener);
    return () => this.snapshotListeners.get(sessionId)?.delete(listener);
  }

  onAnomaly(sessionId: string, listener: AnomalyListener): () => void {
    if (!this.anomalyListeners.has(sessionId)) this.anomalyListeners.set(sessionId, new Set());
    this.anomalyListeners.get(sessionId)!.add(listener);
    return () => this.anomalyListeners.get(sessionId)?.delete(listener);
  }

  private emitSnapshot(sessionId: string, snapshot: DiagnosticsSnapshot): void {
    this.snapshotListeners.get(sessionId)?.forEach((listener) => listener(snapshot));
  }

  private emitAnomaly(sessionId: string, anomaly: RoadAnomalyEvent): void {
    this.anomalyListeners.get(sessionId)?.forEach((listener) => listener(anomaly));
  }
}

// Singleton — one process serves all connected devices, each keyed by session id.
export const sessionManager = new SessionManager();
