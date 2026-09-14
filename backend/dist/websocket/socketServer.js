"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachWebSocketServer = attachWebSocketServer;
const ws_1 = require("ws");
const sessionManager_1 = require("../core/sessionManager");
function send(ws, payload) {
    if (ws.readyState === ws_1.WebSocket.OPEN)
        ws.send(JSON.stringify(payload));
}
/**
 * Real-time ingest endpoint for a single device/vehicle. One WebSocket
 * connection == one navigation session: the phone/device streams raw IMU
 * samples and GNSS fixes up as they arrive from the OS sensor APIs, and the
 * server streams DiagnosticsSnapshots + anomaly events back down at
 * DIAGNOSTICS_BROADCAST_INTERVAL_MS, independent of how fast IMU frames
 * arrive (typically 20-100Hz) — the frontend never needs to throttle
 * incoming socket traffic itself.
 *
 * Wire protocol (JSON text frames both directions):
 *
 *   client -> server
 *     {type:'start_session', sessionId?}       // sessionId omitted => server generates one
 *     {type:'imu', data: ImuSample}             // send as fast as the device produces samples
 *     {type:'gnss', data: GnssFix}               // send on every OS location update
 *     {type:'simulate_outage', enabled}          // SimulateOutageButton
 *     {type:'stop_session'}                      // ends + persists the session
 *
 *   server -> client
 *     {type:'session_started', sessionId}
 *     {type:'diagnostics', data: DiagnosticsSnapshot}   // one per broadcast tick
 *     {type:'anomaly', data: RoadAnomalyEvent}           // fired as detected, out of band
 *     {type:'session_stopped', data: SessionSummary}
 *     {type:'error', message}
 *
 * Disconnecting without sending `stop_session` (e.g. the app crashes, or the
 * phone loses signal) still ends and persists the session — see the
 * `close` handler below — so a session is never silently left running.
 */
function attachWebSocketServer(httpServer) {
    const wss = new ws_1.WebSocketServer({ server: httpServer, path: '/ws' });
    wss.on('connection', (ws) => {
        const state = { sessionId: null, unsubscribeSnapshot: null, unsubscribeAnomaly: null };
        const endSession = async (silent = false) => {
            if (!state.sessionId)
                return;
            const sessionId = state.sessionId;
            state.unsubscribeSnapshot?.();
            state.unsubscribeAnomaly?.();
            state.sessionId = null;
            const summary = await sessionManager_1.sessionManager.stopSession(sessionId);
            if (!silent && summary)
                send(ws, { type: 'session_stopped', data: summary });
        };
        ws.on('message', (raw) => {
            let msg;
            try {
                msg = JSON.parse(raw.toString());
            }
            catch {
                send(ws, { type: 'error', message: 'Invalid JSON frame' });
                return;
            }
            try {
                switch (msg.type) {
                    case 'start_session': {
                        if (state.sessionId) {
                            send(ws, { type: 'error', message: 'Session already started on this connection' });
                            return;
                        }
                        const sessionId = sessionManager_1.sessionManager.startSession(msg.sessionId);
                        state.sessionId = sessionId;
                        state.unsubscribeSnapshot = sessionManager_1.sessionManager.onSnapshot(sessionId, (snapshot) => send(ws, { type: 'diagnostics', data: snapshot }));
                        state.unsubscribeAnomaly = sessionManager_1.sessionManager.onAnomaly(sessionId, (anomaly) => send(ws, { type: 'anomaly', data: anomaly }));
                        send(ws, { type: 'session_started', sessionId });
                        break;
                    }
                    case 'imu': {
                        if (!state.sessionId) {
                            send(ws, { type: 'error', message: 'No active session — send start_session first' });
                            return;
                        }
                        sessionManager_1.sessionManager.ingestImu(state.sessionId, msg.data);
                        break;
                    }
                    case 'gnss': {
                        if (!state.sessionId) {
                            send(ws, { type: 'error', message: 'No active session — send start_session first' });
                            return;
                        }
                        sessionManager_1.sessionManager.ingestGnss(state.sessionId, msg.data);
                        break;
                    }
                    case 'simulate_outage': {
                        if (!state.sessionId) {
                            send(ws, { type: 'error', message: 'No active session — send start_session first' });
                            return;
                        }
                        sessionManager_1.sessionManager.setOutageSimulated(state.sessionId, msg.enabled);
                        break;
                    }
                    case 'stop_session': {
                        void endSession();
                        break;
                    }
                    default:
                        send(ws, { type: 'error', message: `Unknown message type: ${msg.type}` });
                }
            }
            catch (err) {
                send(ws, { type: 'error', message: err instanceof Error ? err.message : 'Unexpected error' });
            }
        });
        ws.on('close', () => {
            void endSession(true);
        });
    });
    return wss;
}
//# sourceMappingURL=socketServer.js.map