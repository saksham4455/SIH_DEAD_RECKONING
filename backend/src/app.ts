import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import { sessionRoutes } from './api/routes/sessionRoutes';
import { dashboardRoutes } from './api/routes/dashboardRoutes';
import { errorHandler } from './api/middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Serves public/device-client.html — a browser page that streams a phone's
  // real accelerometer/gyroscope/GPS to the /ws ingest endpoint, for testing
  // the pipeline against real device data before the native app is wired up.
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: Date.now() });
  });

  app.use('/api/sessions', sessionRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use(errorHandler);

  return app;
}
