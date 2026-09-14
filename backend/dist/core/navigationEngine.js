"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationEngine = void 0;
const kalmanFilter_1 = require("./kalmanFilter");
const deadReckoning_1 = require("./deadReckoning");
const anomalyDetection_1 = require("./anomalyDetection");
const aiInference_1 = require("./aiInference");
const thermalCompensation_1 = require("./thermalCompensation");
const satelliteFusion_1 = require("./satelliteFusion");
const geo_1 = require("../utils/geo");
const matrix_1 = require("../utils/matrix");
const constants_1 = require("../config/constants");
const DEFAULT_THERMAL_INFO = {
    currentTempC: null,
    gyroBiasCorrection: { x: 0, y: 0, z: 0 },
    accelBiasCorrection: { x: 0, y: 0, z: 0 },
    compensationActive: false,
};
const DEFAULT_NAVIC_WEIGHT = {
    navicWeight: 0,
    gpsWeight: 0,
    navicSatCount: 0,
    gpsSatCount: 0,
};
/**
 * Owns all per-session engine state: the Kalman filter, IMU preprocessor,
 * anomaly detector, and the bookkeeping needed to turn raw device samples
 * into a DiagnosticsSnapshot the frontend can render directly.
 *
 * One instance per active session — created by SessionManager on
 * `start_session` and torn down on `stop_session` / disconnect.
 */
class NavigationEngine {
    constructor() {
        this.kf = new kalmanFilter_1.VehicleKalmanFilter();
        this.imuPreprocessor = new deadReckoning_1.ImuPreprocessor();
        this.anomalyDetector = new anomalyDetection_1.RoadAnomalyDetector();
        this.anchor = null;
        this.lastGnssTimestamp = null;
        this.lastGnssQuality = null;
        this.lastSatelliteBreakdown = [];
        this.lastNavicWeight = DEFAULT_NAVIC_WEIGHT;
        this.lastThermalInfo = DEFAULT_THERMAL_INFO;
        this.outageSimulated = false;
        this.anomalies = [];
        this.totalDistanceMeters = 0;
        this.confidenceSum = 0;
        this.confidenceSamples = 0;
    }
    /** Feed one IMU sample through thermal compensation -> DR preprocessing -> KF predict. */
    processImu(sample) {
        const { correctedGyroBias, correctedAccelBias, info } = (0, thermalCompensation_1.computeThermalCompensation)(sample.temperatureC);
        this.lastThermalInfo = info;
        const correctedGyro = (0, thermalCompensation_1.applyBiasCorrection)(sample.gyro, correctedGyroBias);
        const correctedAccel = (0, thermalCompensation_1.applyBiasCorrection)(sample.accel, correctedAccelBias);
        const pre = this.imuPreprocessor.process(sample, correctedGyro, correctedAccel);
        this.kf.predict(pre.forwardAccelMps2, pre.yawRateRadS, pre.dtSeconds);
        this.totalDistanceMeters += Math.abs(this.kf.v) * pre.dtSeconds;
        if (!this.anchor)
            return null; // can't place an anomaly on the map without a GNSS anchor yet
        const { latitude, longitude } = (0, geo_1.enuToLatLon)(this.kf.x, this.kf.y, this.anchor.latitude, this.anchor.longitude);
        const anomaly = this.anomalyDetector.detect(pre.verticalAccelMps2, sample.timestamp, latitude, longitude);
        if (anomaly) {
            this.anomalies.push(anomaly);
            return anomaly;
        }
        return null;
    }
    /** Feed one GNSS fix through satellite weighting -> KF update (unless an outage is simulated). */
    processGnss(fix) {
        const breakdown = (0, satelliteFusion_1.computeSatelliteBreakdown)(fix);
        const navicWeight = (0, satelliteFusion_1.computeNavicWeight)(breakdown);
        if (!this.anchor) {
            // First-ever fix of the session: anchor the local ENU plane here and
            // seed the filter's heading/speed from the fix so DR doesn't start
            // from a meaningless heading of zero.
            this.anchor = { latitude: fix.latitude, longitude: fix.longitude };
            if (typeof fix.bearingDeg === 'number') {
                this.kf.state[3][0] = (0, geo_1.compassDegToHeadingRad)(fix.bearingDeg);
            }
            if (typeof fix.speedMps === 'number') {
                this.kf.state[2][0] = Math.max(0, fix.speedMps);
            }
            this.lastGnssTimestamp = fix.timestamp;
            this.lastSatelliteBreakdown = breakdown;
            this.lastNavicWeight = navicWeight;
            return;
        }
        if (this.outageSimulated) {
            // Deliberately ignore this fix end-to-end (including diagnostics) so
            // the SimulateOutageButton produces a faithful GNSS-denied scenario.
            return;
        }
        const quality = (0, satelliteFusion_1.assessGnssQuality)(fix, navicWeight);
        const { x, y } = (0, geo_1.latLonToEnu)(fix.latitude, fix.longitude, this.anchor.latitude, this.anchor.longitude);
        // Always observe position. Layer in Doppler speed/course-over-ground
        // when the fix provides them — see constants.ts for why this matters.
        const rows = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
        ];
        const measurements = [x, y];
        const variances = [quality.measurementVarianceMeters2, quality.measurementVarianceMeters2];
        const angleRowIndices = [];
        if (typeof fix.speedMps === 'number') {
            rows.push([0, 0, 1, 0]);
            measurements.push(Math.max(0, fix.speedMps));
            variances.push(constants_1.GNSS_SPEED_VARIANCE_MPS2);
        }
        if (typeof fix.bearingDeg === 'number' && (fix.speedMps ?? 0) >= constants_1.MIN_SPEED_FOR_BEARING_MPS) {
            rows.push([0, 0, 0, 1]);
            measurements.push((0, geo_1.compassDegToHeadingRad)(fix.bearingDeg));
            variances.push(constants_1.GNSS_HEADING_VARIANCE_RAD2);
            angleRowIndices.push(rows.length - 1);
        }
        const H = rows;
        this.kf.updateGeneric(H, (0, matrix_1.columnVector)(measurements), (0, matrix_1.diag)(variances), angleRowIndices);
        this.lastGnssTimestamp = fix.timestamp;
        this.lastGnssQuality = quality;
        this.lastSatelliteBreakdown = breakdown;
        this.lastNavicWeight = navicWeight;
    }
    setOutageSimulated(enabled) {
        this.outageSimulated = enabled;
    }
    currentFusionMode(now) {
        if (this.outageSimulated)
            return 'DEAD_RECKONING_ONLY';
        if (this.lastGnssTimestamp === null)
            return 'DEAD_RECKONING_ONLY';
        if (now - this.lastGnssTimestamp > constants_1.GNSS_OUTAGE_TIMEOUT_MS)
            return 'DEAD_RECKONING_ONLY';
        return this.lastGnssQuality?.fusionMode ?? 'FUSION';
    }
    buildSnapshot(sessionId, now) {
        const position = this.anchor
            ? (0, geo_1.enuToLatLon)(this.kf.x, this.kf.y, this.anchor.latitude, this.anchor.longitude)
            : { latitude: 0, longitude: 0 };
        const fusionMode = this.currentFusionMode(now);
        const msSinceLastGnssFix = this.lastGnssTimestamp !== null ? now - this.lastGnssTimestamp : null;
        const aiInference = (0, aiInference_1.computeAiInference)({
            positionUncertaintyMeters: this.kf.positionUncertaintyMeters,
            msSinceLastGnssFix,
            currentFusionMode: fusionMode,
        });
        this.confidenceSum += aiInference.confidenceScore;
        this.confidenceSamples += 1;
        return {
            timestamp: now,
            sessionId,
            vehicleState: {
                timestamp: now,
                latitude: position.latitude,
                longitude: position.longitude,
                headingDeg: (0, geo_1.headingRadToCompassDeg)(this.kf.theta),
                speedMps: this.kf.v,
            },
            fusionMode,
            satelliteBreakdown: this.lastSatelliteBreakdown,
            navicWeight: this.lastNavicWeight,
            aiInference,
            thermalCompensation: this.lastThermalInfo,
            recentAnomalies: this.anomalies.slice(-constants_1.RECENT_ANOMALIES_BUFFER),
            outageSimulated: this.outageSimulated,
            msSinceLastGnssFix,
        };
    }
    getSummaryStats() {
        return {
            distanceMeters: Math.round(this.totalDistanceMeters * 10) / 10,
            anomalyCount: this.anomalies.length,
            avgConfidenceScore: this.confidenceSamples > 0 ? Math.round(this.confidenceSum / this.confidenceSamples) : 0,
        };
    }
    getAllAnomalies() {
        return this.anomalies;
    }
    hasAnchor() {
        return this.anchor !== null;
    }
}
exports.NavigationEngine = NavigationEngine;
//# sourceMappingURL=navigationEngine.js.map