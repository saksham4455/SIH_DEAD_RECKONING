"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const socketServer_1 = require("./websocket/socketServer");
const PORT = Number(process.env.PORT ?? 8080);
const app = (0, app_1.createApp)();
const httpServer = http_1.default.createServer(app);
(0, socketServer_1.attachWebSocketServer)(httpServer);
httpServer.listen(PORT, () => {
    console.log(`[server] REST API listening on http://localhost:${PORT}/api`);
    console.log(`[server] WebSocket ingest listening on ws://localhost:${PORT}/ws`);
    console.log(`[server] Test device client at http://localhost:${PORT}/device-client.html`);
});
function shutdown(signal) {
    console.log(`[server] received ${signal}, shutting down...`);
    httpServer.close(() => process.exit(0));
    // Force-exit if connections don't close promptly.
    setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
//# sourceMappingURL=server.js.map