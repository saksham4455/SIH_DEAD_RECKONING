import fs from 'fs/promises';
import path from 'path';
import { DashboardAggregate, SessionDetail, SessionSummary } from '../types/navigation';

/**
 * Lightweight file-backed store for finished sessions. A real deployment
 * would swap this for Postgres/Mongo without touching any caller — every
 * function here is already async and returns plain domain types, so the
 * routes and SessionManager never know the difference.
 */
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'sessions.json');

let writeQueue: Promise<unknown> = Promise.resolve();

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ sessions: [] }, null, 2));
  }
}

async function readAll(): Promise<SessionDetail[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  try {
    const parsed = JSON.parse(raw) as { sessions?: SessionDetail[] };
    return Array.isArray(parsed.sessions) ? parsed.sessions : [];
  } catch {
    return [];
  }
}

async function writeAll(sessions: SessionDetail[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify({ sessions }, null, 2));
}

/** Serializes writes so two sessions ending at the same instant can't clobber each other. */
function enqueueWrite<T>(job: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(job, job);
  writeQueue = result.catch(() => undefined);
  return result;
}

export async function saveSessionDetail(detail: SessionDetail): Promise<void> {
  await enqueueWrite(async () => {
    const sessions = await readAll();
    const idx = sessions.findIndex((s) => s.id === detail.id);
    if (idx >= 0) sessions[idx] = detail;
    else sessions.push(detail);
    await writeAll(sessions);
  });
}

function toSummary(detail: SessionDetail): SessionSummary {
  const { track: _track, anomalies: _anomalies, ...summary } = detail;
  return summary;
}

export async function listSessions(): Promise<SessionSummary[]> {
  const sessions = await readAll();
  return sessions.map(toSummary).sort((a, b) => b.startedAt - a.startedAt);
}

export async function getSessionDetail(id: string): Promise<SessionDetail | null> {
  const sessions = await readAll();
  return sessions.find((s) => s.id === id) ?? null;
}

export async function deleteSession(id: string): Promise<boolean> {
  return enqueueWrite(async () => {
    const sessions = await readAll();
    const next = sessions.filter((s) => s.id !== id);
    if (next.length === sessions.length) return false;
    await writeAll(next);
    return true;
  });
}

export async function getDashboardAggregate(): Promise<DashboardAggregate> {
  const sessions = await readAll();
  const totalSessions = sessions.length;
  const totalDistanceMeters = sessions.reduce((sum, s) => sum + s.distanceMeters, 0);
  const totalAnomalies = sessions.reduce((sum, s) => sum + s.anomalyCount, 0);
  const avgConfidenceScore =
    totalSessions > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.avgConfidenceScore, 0) / totalSessions)
      : 0;

  return {
    totalSessions,
    totalDistanceMeters: Math.round(totalDistanceMeters * 10) / 10,
    totalAnomalies,
    avgConfidenceScore,
    recentSessions: sessions.map(toSummary).sort((a, b) => b.startedAt - a.startedAt).slice(0, 5),
  };
}
