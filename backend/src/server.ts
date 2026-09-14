import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { createApp } from './app';
import { attachWebSocketServer } from './websocket/socketServer';

const PORT = Number(process.env.PORT ?? 8080);

const app = createApp();
const httpServer = http.createServer(app);
attachWebSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`[server] REST API listening on http://localhost:${PORT}/api`);
  console.log(`[server] WebSocket ingest listening on ws://localhost:${PORT}/ws`);
  console.log(`[server] Test device client at http://localhost:${PORT}/device-client.html`);
});

function shutdown(signal: string): void {
  console.log(`[server] received ${signal}, shutting down...`);
  httpServer.close(() => process.exit(0));
  // Force-exit if connections don't close promptly.
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
