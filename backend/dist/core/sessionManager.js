"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionManager = exports.SessionManager = void 0;
const uuid_1 = require("uuid");
const navigationEngine_1 = require("./navigationEngine");
const sessionStore_1 = require("../services/sessionStore");
const constants_1 = require("../config/constants");
/**
 * Owns the set of currently-live NavigationEngines — one per connected
 * device/session — plus the periodic diagnostics-broadcast loop. This is
 * the glue between the transport layer (WebSocket: raw device frames in,
 * diagnostics snapshots out) and the pure NavigationEngine math, so the
 * engine itself never has to know about sockets, timers, or persistence.
 */
class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.snapshotListeners = new Map();
        this.anomalyListeners = new Map();
    }
    /** Start (or resume tracking, if already active) a session. Returns the session id. */
    startSession(sessionId = (0, uuid_1.v4)()) {
        if (this.sessions.has(sessionId))
            return sessionId;
        const session = {
            id: sessionId,
            engine: new navigationEngine_1.NavigationEngine(),
            startedAt: Date.now(),
            track: [],
            broadcastTimer: null,
        };
        session.broadcastTimer = setInterval(() => {
            const snapshot = session.engine.buildSnapshot(sessionId, Date.now());
            session.track.push(snapshot.vehicleState);
            this.emitSnapshot(sessionId, snapshot);
        }, constants_1.DIAGNOSTICS_BROADCAST_INTERVAL_MS);
        this.sessions.set(sessionId, session);
        return sessionId;
    }
    ingestImu(sessionId, sample) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return;
        const anomaly = session.engine.processImu(sample);
        if (anomaly)
            this.emitAnomaly(sessionId, anomaly);
    }
    ingestGnss(sessionId, fix) {
        this.sessions.get(sessionId)?.engine.processGnss(fix);
    }
    setOutageSimulated(sessionId, enabled) {
        this.sessions.get(sessionId)?.engine.setOutageSimulated(enabled);
    }
    /** On-demand snapshot, e.g. for a REST poll fallback if a client can't hold a WebSocket open. */
    getSnapshot(sessionId) {
        const session = this.sessions.get(sessionId);
        return session ? session.engine.buildSnapshot(sessionId, Date.now()) : null;
    }
    async stopSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return null;
        if (session.broadcastTimer)
            clearInterval(session.broadcastTimer);
        const stats = session.engine.getSummaryStats();
        const summary = {
            id: sessionId,
            startedAt: session.startedAt,
            endedAt: Date.now(),
            distanceMeters: stats.distanceMeters,
            anomalyCount: stats.anomalyCount,
            avgConfidenceScore: stats.avgConfidenceScore,
        };
        const detail = {
            ...summary,
            track: session.track,
            anomalies: session.engine.getAllAnomalies(),
        };
        await (0, sessionStore_1.saveSessionDetail)(detail);
        this.sessions.delete(sessionId);
        this.snapshotListeners.delete(sessionId);
        this.anomalyListeners.delete(sessionId);
        return summary;
    }
    hasSession(sessionId) {
        return this.sessions.has(sessionId);
    }
    onSnapshot(sessionId, listener) {
        if (!this.snapshotListeners.has(sessionId))
            this.snapshotListeners.set(sessionId, new Set());
        this.snapshotListeners.get(sessionId).add(listener);
        return () => this.snapshotListeners.get(sessionId)?.delete(listener);
    }
    onAnomaly(sessionId, listener) {
        if (!this.anomalyListeners.has(sessionId))
            this.anomalyListeners.set(sessionId, new Set());
        this.anomalyListeners.get(sessionId).add(listener);
        return () => this.anomalyListeners.get(sessionId)?.delete(listener);
    }
    emitSnapshot(sessionId, snapshot) {
        this.snapshotListeners.get(sessionId)?.forEach((listener) => listener(snapshot));
    }
    emitAnomaly(sessionId, anomaly) {
        this.anomalyListeners.get(sessionId)?.forEach((listener) => listener(anomaly));
    }
}
exports.SessionManager = SessionManager;
// Singleton — one process serves all connected devices, each keyed by session id.
exports.sessionManager = new SessionManager();
//# sourceMappingURL=sessionManager.js.map