"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImuPreprocessor = void 0;
const constants_1 = require("../config/constants");
/**
 * Converts a single, already bias-corrected IMU sample into the scalar
 * quantities the 2D CTRV Kalman filter and the anomaly detector need:
 *
 *  - forwardAccelMps2: acceleration along the vehicle's direction of
 *    travel, used to propagate speed in VehicleKalmanFilter.predict()
 *  - yawRateRadS: rotation rate about the vertical axis, used to
 *    propagate heading
 *  - verticalAccelMps2: gravity-removed vertical acceleration, fed to
 *    RoadAnomalyDetector for pothole/bump detection
 *  - dtSeconds: time elapsed since the previous sample (0 on the very
 *    first sample of a session, so the filter doesn't take a bogus
 *    prediction step against an unknown interval)
 *
 * ASSUMPTION: the device is mounted with a reasonably flat, fixed
 * orientation — phone flat in a dash/window mount, x-axis pointing in the
 * direction of travel, z-axis pointing up. That's a fair assumption for a
 * dedicated dash-mounted tracker but not for a phone loose in a pocket.
 * A production build would insert a device-attitude estimator (e.g. a
 * Madgwick/complementary filter fusing gyro+accel+magnetometer) upstream
 * of this class to project raw device-frame samples into the vehicle
 * frame regardless of mounting angle; that's flagged here rather than
 * implemented so the rest of the fusion math stays easy to reason about.
 */
class ImuPreprocessor {
    constructor() {
        this.lastTimestamp = null;
    }
    process(_sample, correctedGyro, correctedAccel) {
        const timestamp = _sample.timestamp;
        const dtSecondsRaw = this.lastTimestamp !== null ? (timestamp - this.lastTimestamp) / 1000 : 0;
        this.lastTimestamp = timestamp;
        const dtSeconds = dtSecondsRaw > 0 && Number.isFinite(dtSecondsRaw) ? dtSecondsRaw : 0;
        return {
            forwardAccelMps2: correctedAccel.x,
            yawRateRadS: correctedGyro.z,
            verticalAccelMps2: correctedAccel.z - constants_1.GRAVITY_MPS2,
            dtSeconds,
        };
    }
}
exports.ImuPreprocessor = ImuPreprocessor;
//# sourceMappingURL=deadReckoning.js.map