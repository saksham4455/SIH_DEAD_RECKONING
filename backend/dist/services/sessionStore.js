"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSessionDetail = saveSessionDetail;
exports.listSessions = listSessions;
exports.getSessionDetail = getSessionDetail;
exports.deleteSession = deleteSession;
exports.getDashboardAggregate = getDashboardAggregate;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
/**
 * Lightweight file-backed store for finished sessions. A real deployment
 * would swap this for Postgres/Mongo without touching any caller — every
 * function here is already async and returns plain domain types, so the
 * routes and SessionManager never know the difference.
 */
const DATA_DIR = path_1.default.join(__dirname, '..', '..', 'data');
const DATA_FILE = path_1.default.join(DATA_DIR, 'sessions.json');
let writeQueue = Promise.resolve();
async function ensureDataFile() {
    await promises_1.default.mkdir(DATA_DIR, { recursive: true });
    try {
        await promises_1.default.access(DATA_FILE);
    }
    catch {
        await promises_1.default.writeFile(DATA_FILE, JSON.stringify({ sessions: [] }, null, 2));
    }
}
async function readAll() {
    await ensureDataFile();
    const raw = await promises_1.default.readFile(DATA_FILE, 'utf-8');
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed.sessions) ? parsed.sessions : [];
    }
    catch {
        return [];
    }
}
async function writeAll(sessions) {
    await ensureDataFile();
    await promises_1.default.writeFile(DATA_FILE, JSON.stringify({ sessions }, null, 2));
}
/** Serializes writes so two sessions ending at the same instant can't clobber each other. */
function enqueueWrite(job) {
    const result = writeQueue.then(job, job);
    writeQueue = result.catch(() => undefined);
    return result;
}
async function saveSessionDetail(detail) {
    await enqueueWrite(async () => {
        const sessions = await readAll();
        const idx = sessions.findIndex((s) => s.id === detail.id);
        if (idx >= 0)
            sessions[idx] = detail;
        else
            sessions.push(detail);
        await writeAll(sessions);
    });
}
function toSummary(detail) {
    const { track: _track, anomalies: _anomalies, ...summary } = detail;
    return summary;
}
async function listSessions() {
    const sessions = await readAll();
    return sessions.map(toSummary).sort((a, b) => b.startedAt - a.startedAt);
}
async function getSessionDetail(id) {
    const sessions = await readAll();
    return sessions.find((s) => s.id === id) ?? null;
}
async function deleteSession(id) {
    return enqueueWrite(async () => {
        const sessions = await readAll();
        const next = sessions.filter((s) => s.id !== id);
        if (next.length === sessions.length)
            return false;
        await writeAll(next);
        return true;
    });
}
async function getDashboardAggregate() {
    const sessions = await readAll();
    const totalSessions = sessions.length;
    const totalDistanceMeters = sessions.reduce((sum, s) => sum + s.distanceMeters, 0);
    const totalAnomalies = sessions.reduce((sum, s) => sum + s.anomalyCount, 0);
    const avgConfidenceScore = totalSessions > 0
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
//# sourceMappingURL=sessionStore.js.map