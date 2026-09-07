import { Router } from 'express';
import { getDashboardAggregate } from '../../services/sessionStore';

export const dashboardRoutes = Router();

// GET /api/dashboard/summary — feeds the StatCards on DashboardScreen
dashboardRoutes.get('/summary', async (_req, res, next) => {
  try {
    const aggregate = await getDashboardAggregate();
    res.json(aggregate);
  } catch (err) {
    next(err);
  }
});
