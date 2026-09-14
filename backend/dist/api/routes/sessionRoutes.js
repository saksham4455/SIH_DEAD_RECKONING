"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRoutes = void 0;
const express_1 = require("express");
const sessionStore_1 = require("../../services/sessionStore");
const sessionManager_1 = require("../../core/sessionManager");
exports.sessionRoutes = (0, express_1.Router)();
// GET /api/sessions — used by DashboardScreen to list past recordings
exports.sessionRoutes.get('/', async (_req, res, next) => {
    try {
        const sessions = await (0, sessionStore_1.listSessions)();
        res.json({ sessions });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/sessions/:id — full track + anomalies, e.g. for a "review session" view
exports.sessionRoutes.get('/:id', async (req, res, next) => {
    try {
        const detail = await (0, sessionStore_1.getSessionDetail)(req.params.id);
        if (!detail) {
            res.status(404).json({ error: `Session ${req.params.id} not found` });
            return;
        }
        res.json(detail);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/sessions/:id/live — polling fallback for a live session's current snapshot
// (the primary real-time path is the /ws WebSocket; this exists for clients
// that can't hold a socket open, e.g. quick debugging with curl).
exports.sessionRoutes.get('/:id/live', (req, res) => {
    const snapshot = sessionManager_1.sessionManager.getSnapshot(req.params.id);
    if (!snapshot) {
        res.status(404).json({ error: `No active session ${req.params.id}` });
        return;
    }
    res.json(snapshot);
});
// DELETE /api/sessions/:id — used by RecordingControls to discard a recording
exports.sessionRoutes.delete('/:id', async (req, res, next) => {
    try {
        const existed = await (0, sessionStore_1.deleteSession)(req.params.id);
        if (!existed) {
            res.status(404).json({ error: `Session ${req.params.id} not found` });
            return;
        }
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=sessionRoutes.js.map