import { Router } from 'express';
import { deleteSession, getSessionDetail, listSessions } from '../../services/sessionStore';
import { sessionManager } from '../../core/sessionManager';

export const sessionRoutes = Router();

// GET /api/sessions — used by DashboardScreen to list past recordings
sessionRoutes.get('/', async (_req, res, next) => {
  try {
    const sessions = await listSessions();
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
});

// GET /api/sessions/:id — full track + anomalies, e.g. for a "review session" view
sessionRoutes.get('/:id', async (req, res, next) => {
  try {
    const detail = await getSessionDetail(req.params.id);
    if (!detail) {
      res.status(404).json({ error: `Session ${req.params.id} not found` });
      return;
    }
    res.json(detail);
  } catch (err) {
    next(err);
  }
});

// GET /api/sessions/:id/live — polling fallback for a live session's current snapshot
// (the primary real-time path is the /ws WebSocket; this exists for clients
// that can't hold a socket open, e.g. quick debugging with curl).
sessionRoutes.get('/:id/live', (req, res) => {
  const snapshot = sessionManager.getSnapshot(req.params.id);
  if (!snapshot) {
    res.status(404).json({ error: `No active session ${req.params.id}` });
    return;
  }
  res.json(snapshot);
});

// DELETE /api/sessions/:id — used by RecordingControls to discard a recording
sessionRoutes.delete('/:id', async (req, res, next) => {
  try {
    const existed = await deleteSession(req.params.id);
    if (!existed) {
      res.status(404).json({ error: `Session ${req.params.id} not found` });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
