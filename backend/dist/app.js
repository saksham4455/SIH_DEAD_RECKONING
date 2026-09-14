"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const sessionRoutes_1 = require("./api/routes/sessionRoutes");
const dashboardRoutes_1 = require("./api/routes/dashboardRoutes");
const errorHandler_1 = require("./api/middleware/errorHandler");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // Serves public/device-client.html — a browser page that streams a phone's
    // real accelerometer/gyroscope/GPS to the /ws ingest endpoint, for testing
    // the pipeline against real device data before the native app is wired up.
    app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok', time: Date.now() });
    });
    app.use('/api/sessions', sessionRoutes_1.sessionRoutes);
    app.use('/api/dashboard', dashboardRoutes_1.dashboardRoutes);
    app.use(errorHandler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map