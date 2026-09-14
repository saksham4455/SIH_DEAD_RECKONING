"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleKalmanFilter = void 0;
const matrix_1 = require("../utils/matrix");
const constants_1 = require("../config/constants");
const geo_1 = require("../utils/geo");
/**
 * State vector X = [x, y, v, theta]
 *   x, y   — position in the local ENU plane (meters, anchored at session start)
 *   v      — forward speed (m/s)
 *   theta  — heading, standard math angle in radians (0 = East, CCW positive)
 *
 * This is the classic "constant turn-rate and velocity" EKF used for
 * ground vehicle tracking: dead reckoning (IMU) drives the nonlinear
 * PREDICT step every sample, GNSS fixes drive the linear UPDATE step
 * whenever a fix is available and not suppressed by a simulated outage.
 */
class VehicleKalmanFilter {
    constructor(initialX = 0, initialY = 0, initialV = 0, initialTheta = 0) {
        this.state = (0, matrix_1.columnVector)([initialX, initialY, initialV, initialTheta]);
        // Start fairly uncertain in position/velocity (units: m^2, (m/s)^2), but
        // NOT in heading — heading is in radians, so a variance of e.g. 25 rad^2
        // would be a nonsensical "±5 radian" uncertainty and would blow up the
        // position estimate almost immediately via the F[0][3]/F[1][3] coupling
        // terms in predict(). Each diagonal entry is scaled to its own units.
        this.covariance = (0, matrix_1.zeros)(4, 4);
        this.covariance[0][0] = 25; // position x: (5 m)^2
        this.covariance[1][1] = 25; // position y: (5 m)^2
        this.covariance[2][2] = 9; // speed: (3 m/s)^2
        this.covariance[3][3] = 0.3; // heading: (~31 deg)^2 in rad^2
    }
    get x() {
        return this.state[0][0];
    }
    get y() {
        return this.state[1][0];
    }
    get v() {
        return this.state[2][0];
    }
    get theta() {
        return this.state[3][0];
    }
    /** 1-sigma position uncertainty (meters), derived from the position block of P. */
    get positionUncertaintyMeters() {
        return Math.sqrt(Math.max(this.covariance[0][0], 0) + Math.max(this.covariance[1][1], 0));
    }
    /**
     * PREDICT step — dead reckoning propagation from IMU-derived inputs.
     * @param forwardAccelMps2 thermal-compensated forward acceleration (vehicle frame)
     * @param yawRateRadS thermal-compensated yaw rate (vehicle frame)
     * @param dtSeconds time since the previous IMU sample
     */
    predict(forwardAccelMps2, yawRateRadS, dtSeconds) {
        if (dtSeconds <= 0 || !Number.isFinite(dtSeconds))
            return;
        const thetaPrev = this.theta;
        const vPrev = this.v;
        const thetaNew = thetaPrev + yawRateRadS * dtSeconds;
        const vNew = Math.max(0, vPrev + forwardAccelMps2 * dtSeconds); // vehicles don't reverse-integrate below 0 here
        const xNew = this.x + vNew * Math.cos(thetaNew) * dtSeconds;
        const yNew = this.y + vNew * Math.sin(thetaNew) * dtSeconds;
        // Jacobian of the motion model w.r.t. the previous state.
        const F = [
            [1, 0, Math.cos(thetaNew) * dtSeconds, -vNew * Math.sin(thetaNew) * dtSeconds],
            [0, 1, Math.sin(thetaNew) * dtSeconds, vNew * Math.cos(thetaNew) * dtSeconds],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ];
        const Q = (0, matrix_1.zeros)(4, 4);
        Q[2][2] = constants_1.PROCESS_NOISE.velocity * dtSeconds;
        Q[3][3] = constants_1.PROCESS_NOISE.heading * dtSeconds;
        this.state = (0, matrix_1.columnVector)([xNew, yNew, vNew, thetaNew]);
        this.covariance = (0, matrix_1.add)((0, matrix_1.multiply)((0, matrix_1.multiply)(F, this.covariance), (0, matrix_1.transpose)(F)), Q);
    }
    /**
     * UPDATE step — fuse an arbitrary linear combination of GNSS-derived
     * measurements against the state. Position-only fixes only correct x,y;
     * without ever correcting v or theta directly, v tends to random-walk
     * toward zero between fixes (pure accelerometer double-integration is
     * notoriously drift-prone). Real GNSS chipsets also report Doppler-
     * derived speed and course-over-ground, so this engine feeds those in
     * too whenever the fix provides them — see NavigationEngine.processGnss.
     *
     * @param H measurement matrix (rows x 4)
     * @param z measurement vector (rows x 1)
     * @param R measurement noise covariance (rows x rows)
     * @param angleRowIndices which rows of the innovation represent an angle
     *   (radians) and need [-pi, pi) wrapping before use — e.g. heading.
     */
    updateGeneric(H, z, R, angleRowIndices = []) {
        const predicted = (0, matrix_1.multiply)(H, this.state);
        const innovation = (0, matrix_1.subtract)(z, predicted);
        for (const idx of angleRowIndices) {
            innovation[idx][0] = (0, geo_1.wrapAngleRad)(innovation[idx][0]);
        }
        const S = (0, matrix_1.add)((0, matrix_1.multiply)((0, matrix_1.multiply)(H, this.covariance), (0, matrix_1.transpose)(H)), R);
        const K = (0, matrix_1.multiply)((0, matrix_1.multiply)(this.covariance, (0, matrix_1.transpose)(H)), (0, matrix_1.invert)(S));
        this.state = (0, matrix_1.add)(this.state, (0, matrix_1.multiply)(K, innovation));
        const I = (0, matrix_1.identity)(4);
        this.covariance = (0, matrix_1.multiply)((0, matrix_1.subtract)(I, (0, matrix_1.multiply)(K, H)), this.covariance);
    }
    /** Convenience wrapper: position-only update (always available whenever there's a fix). */
    updatePosition(measuredX, measuredY, varianceMeters2) {
        const H = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
        ];
        const R = [
            [varianceMeters2, 0],
            [0, varianceMeters2],
        ];
        this.updateGeneric(H, (0, matrix_1.columnVector)([measuredX, measuredY]), R);
    }
    snapshot() {
        return {
            x: this.x,
            y: this.y,
            v: this.v,
            theta: this.theta,
            positionUncertaintyMeters: this.positionUncertaintyMeters,
        };
    }
}
exports.VehicleKalmanFilter = VehicleKalmanFilter;
//# sourceMappingURL=kalmanFilter.js.map