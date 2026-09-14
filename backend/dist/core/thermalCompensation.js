"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeThermalCompensation = computeThermalCompensation;
exports.applyBiasCorrection = applyBiasCorrection;
const constants_1 = require("../config/constants");
/**
 * MEMS accelerometers/gyroscopes drift with die temperature. If the device
 * exposes a temperature reading alongside the IMU sample (some Android
 * devices do via the ambient/IMU temperature sensor; many phones don't),
 * this applies a simple linear bias correction calibrated around a
 * reference temperature. Without a temperature reading it falls back to
 * the static calibrated bias with `compensationActive = false` so the
 * frontend's ThermalCompensationCard can show that it's running open-loop.
 */
function computeThermalCompensation(temperatureC) {
    const hasTemp = typeof temperatureC === 'number' && Number.isFinite(temperatureC);
    const deltaT = hasTemp ? temperatureC - constants_1.THERMAL_REFERENCE_TEMP_C : 0;
    const correctedGyroBias = {
        x: constants_1.GYRO_BASE_BIAS[0] + constants_1.GYRO_TEMP_COEFF_RAD_S_PER_C * deltaT,
        y: constants_1.GYRO_BASE_BIAS[1] + constants_1.GYRO_TEMP_COEFF_RAD_S_PER_C * deltaT,
        z: constants_1.GYRO_BASE_BIAS[2] + constants_1.GYRO_TEMP_COEFF_RAD_S_PER_C * deltaT,
    };
    const correctedAccelBias = {
        x: constants_1.ACCEL_BASE_BIAS[0] + constants_1.ACCEL_TEMP_COEFF_MPS2_PER_C * deltaT,
        y: constants_1.ACCEL_BASE_BIAS[1] + constants_1.ACCEL_TEMP_COEFF_MPS2_PER_C * deltaT,
        z: constants_1.ACCEL_BASE_BIAS[2] + constants_1.ACCEL_TEMP_COEFF_MPS2_PER_C * deltaT,
    };
    return {
        correctedGyroBias,
        correctedAccelBias,
        info: {
            currentTempC: hasTemp ? temperatureC : null,
            gyroBiasCorrection: correctedGyroBias,
            accelBiasCorrection: correctedAccelBias,
            compensationActive: hasTemp,
        },
    };
}
function applyBiasCorrection(raw, bias) {
    return { x: raw.x - bias.x, y: raw.y - bias.y, z: raw.z - bias.z };
}
//# sourceMappingURL=thermalCompensation.js.map