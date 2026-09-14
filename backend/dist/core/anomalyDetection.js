"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoadAnomalyDetector = void 0;
const uuid_1 = require("uuid");
const constants_1 = require("../config/constants");
function classifySeverity(magnitude) {
    if (magnitude >= constants_1.ANOMALY_THRESHOLD_MPS2.HIGH)
        return 'HIGH';
    if (magnitude >= constants_1.ANOMALY_THRESHOLD_MPS2.MEDIUM)
        return 'MEDIUM';
    if (magnitude >= constants_1.ANOMALY_THRESHOLD_MPS2.LOW)
        return 'LOW';
    return null;
}
/**
 * Detects potholes/speed bumps from spikes in gravity-removed vertical
 * acceleration. Keeps a short rolling baseline so the threshold adapts
 * a little to generally rough vs generally smooth road surfaces, then
 * debounces so a single bump doesn't fire repeated events as it rings down.
 */
class RoadAnomalyDetector {
    constructor() {
        this.window = [];
        this.lastEventAt = 0;
    }
    detect(verticalAccelMps2, timestamp, latitude, longitude) {
        this.window.push(Math.abs(verticalAccelMps2));
        if (this.window.length > constants_1.ANOMALY_WINDOW_SIZE)
            this.window.shift();
        const baseline = this.window.reduce((s, v) => s + v, 0) / this.window.length;
        const deviation = Math.abs(verticalAccelMps2) - baseline;
        const severity = classifySeverity(deviation);
        if (!severity)
            return null;
        if (timestamp - this.lastEventAt < constants_1.ANOMALY_MIN_INTERVAL_MS)
            return null;
        this.lastEventAt = timestamp;
        return {
            id: (0, uuid_1.v4)(),
            timestamp,
            latitude,
            longitude,
            severity,
            verticalAccelMps2,
        };
    }
}
exports.RoadAnomalyDetector = RoadAnomalyDetector;
//# sourceMappingURL=anomalyDetection.js.map