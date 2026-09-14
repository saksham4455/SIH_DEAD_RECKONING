"use strict";
/**
 * All the "magic numbers" for the fusion/DR engine live here so they can be
 * tuned for a real vehicle/phone rig without hunting through the codebase.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RECENT_ANOMALIES_BUFFER = exports.DIAGNOSTICS_BROADCAST_INTERVAL_MS = exports.CONFIDENCE_DEAD_RECKONING_TIME_PENALTY_PER_SEC = exports.CONFIDENCE_DRIFT_PENALTY_PER_METER = exports.ACCEL_BASE_BIAS = exports.GYRO_BASE_BIAS = exports.ACCEL_TEMP_COEFF_MPS2_PER_C = exports.GYRO_TEMP_COEFF_RAD_S_PER_C = exports.THERMAL_REFERENCE_TEMP_C = exports.ANOMALY_MIN_INTERVAL_MS = exports.ANOMALY_THRESHOLD_MPS2 = exports.ANOMALY_WINDOW_SIZE = exports.MIN_SPEED_FOR_BEARING_MPS = exports.GNSS_HEADING_VARIANCE_RAD2 = exports.GNSS_SPEED_VARIANCE_MPS2 = exports.GNSS_OUTAGE_TIMEOUT_MS = exports.HDOP_DEGRADED_THRESHOLD = exports.MIN_SATELLITES_FOR_GOOD_FIX = exports.DEFAULT_HDOP = exports.UERE_METERS = exports.PROCESS_NOISE = exports.GRAVITY_MPS2 = exports.EARTH_RADIUS_METERS = void 0;
exports.EARTH_RADIUS_METERS = 6378137; // WGS-84 semi-major axis
/** Gravity used to strip the gravity component out of raw accelerometer readings. */
exports.GRAVITY_MPS2 = 9.80665;
// ---- Kalman filter process noise (tune against real drive logs) ----
exports.PROCESS_NOISE = {
    velocity: 0.35, // (m/s^2)^2 per second — uncertainty growth in speed estimate
    heading: 0.02, // (rad)^2 per second — uncertainty growth in heading estimate
};
// ---- GNSS measurement noise model ----
// sigma (meters) = UERE * HDOP. UERE = User Equivalent Range Error, a rough
// per-constellation accuracy assumption for a consumer-grade phone chipset.
exports.UERE_METERS = {
    GPS: 4.0,
    NAVIC: 5.5, // single-frequency L5, fewer satellites in view historically
    OTHER: 6.0,
};
exports.DEFAULT_HDOP = 2.5; // assumed when a fix omits HDOP
// ---- Fusion mode thresholds ----
exports.MIN_SATELLITES_FOR_GOOD_FIX = 5;
exports.HDOP_DEGRADED_THRESHOLD = 4.0;
exports.GNSS_OUTAGE_TIMEOUT_MS = Number(process.env.GNSS_OUTAGE_TIMEOUT_MS ?? 3000);
// Doppler-derived speed/course-over-ground from the GNSS chipset are
// typically much more accurate than double-integrating accelerometer
// noise, so whenever a fix reports them the filter fuses them directly —
// this is what keeps the velocity state from drifting to zero between
// position fixes. Bearing is only trusted above a minimum speed since
// GNSS course-over-ground is meaningless/noisy near-stationary.
exports.GNSS_SPEED_VARIANCE_MPS2 = 0.25; // (0.5 m/s)^2
exports.GNSS_HEADING_VARIANCE_RAD2 = 0.03; // (~10 deg)^2 in rad^2
exports.MIN_SPEED_FOR_BEARING_MPS = 1.5;
// ---- Road anomaly detection ----
exports.ANOMALY_WINDOW_SIZE = 25; // rolling samples used for the moving baseline
exports.ANOMALY_THRESHOLD_MPS2 = {
    LOW: 2.5,
    MEDIUM: 4.5,
    HIGH: 7.0,
};
exports.ANOMALY_MIN_INTERVAL_MS = 500; // debounce so one bump doesn't fire 10 events
// ---- Thermal compensation ----
// Linear bias-vs-temperature model: bias = baseBias + coeff * (temp - refTemp).
// Coefficients are illustrative MEMS IMU figures (deg/s per °C, m/s^2 per °C) —
// replace with values from an actual calibration sweep of the target device.
exports.THERMAL_REFERENCE_TEMP_C = 25;
exports.GYRO_TEMP_COEFF_RAD_S_PER_C = 0.0008;
exports.ACCEL_TEMP_COEFF_MPS2_PER_C = 0.0015;
exports.GYRO_BASE_BIAS = [0, 0, 0];
exports.ACCEL_BASE_BIAS = [0, 0, 0];
// ---- AI inference confidence heuristic ----
exports.CONFIDENCE_DRIFT_PENALTY_PER_METER = 3; // points lost per meter of 1-sigma drift
exports.CONFIDENCE_DEAD_RECKONING_TIME_PENALTY_PER_SEC = 1.5;
// ---- Diagnostics broadcast throttling ----
exports.DIAGNOSTICS_BROADCAST_INTERVAL_MS = Number(process.env.DIAGNOSTICS_BROADCAST_INTERVAL_MS ?? 200);
exports.RECENT_ANOMALIES_BUFFER = 10;
//# sourceMappingURL=constants.js.map