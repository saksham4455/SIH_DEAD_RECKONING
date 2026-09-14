"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = void 0;
const express_1 = require("express");
const sessionStore_1 = require("../../services/sessionStore");
exports.dashboardRoutes = (0, express_1.Router)();
// GET /api/dashboard/summary — feeds the StatCards on DashboardScreen
exports.dashboardRoutes.get('/summary', async (_req, res, next) => {
    try {
        const aggregate = await (0, sessionStore_1.getDashboardAggregate)();
        res.json(aggregate);
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=dashboardRoutes.js.map