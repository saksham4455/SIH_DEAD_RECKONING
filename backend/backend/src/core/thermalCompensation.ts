import { Vector3 } from '../types/navigation';
import {
  ACCEL_BASE_BIAS,
  ACCEL_TEMP_COEFF_MPS2_PER_C,
  GYRO_BASE_BIAS,
  GYRO_TEMP_COEFF_RAD_S_PER_C,
  THERMAL_REFERENCE_TEMP_C,
} from '../config/constants';
import { ThermalCompensationInfo } from '../types/navigation';

/**
 * MEMS accelerometers/gyroscopes drift with die temperature. If the device
 * exposes a temperature reading alongside the IMU sample (some Android
 * devices do via the ambient/IMU temperature sensor; many phones don't),
 * this applies a simple linear bias correction calibrated around a
 * reference temperature. Without a temperature reading it falls back to
 * the static calibrated bias with `compensationActive = false` so the
 * frontend's ThermalCompensationCard can show that it's running open-loop.
 */
export function computeThermalCompensation(temperatureC: number | undefined | null): {
  correctedGyroBias: Vector3;
  correctedAccelBias: Vector3;
  info: ThermalCompensationInfo;
} {
  const hasTemp = typeof temperatureC === 'number' && Number.isFinite(temperatureC);
  const deltaT = hasTemp ? (temperatureC as number) - THERMAL_REFERENCE_TEMP_C : 0;

  const correctedGyroBias: Vector3 = {
    x: GYRO_BASE_BIAS[0] + GYRO_TEMP_COEFF_RAD_S_PER_C * deltaT,
    y: GYRO_BASE_BIAS[1] + GYRO_TEMP_COEFF_RAD_S_PER_C * deltaT,
    z: GYRO_BASE_BIAS[2] + GYRO_TEMP_COEFF_RAD_S_PER_C * deltaT,
  };
  const correctedAccelBias: Vector3 = {
    x: ACCEL_BASE_BIAS[0] + ACCEL_TEMP_COEFF_MPS2_PER_C * deltaT,
    y: ACCEL_BASE_BIAS[1] + ACCEL_TEMP_COEFF_MPS2_PER_C * deltaT,
    z: ACCEL_BASE_BIAS[2] + ACCEL_TEMP_COEFF_MPS2_PER_C * deltaT,
  };

  return {
    correctedGyroBias,
    correctedAccelBias,
    info: {
      currentTempC: hasTemp ? (temperatureC as number) : null,
      gyroBiasCorrection: correctedGyroBias,
      accelBiasCorrection: correctedAccelBias,
      compensationActive: hasTemp,
    },
  };
}

export function applyBiasCorrection(raw: Vector3, bias: Vector3): Vector3 {
  return { x: raw.x - bias.x, y: raw.y - bias.y, z: raw.z - bias.z };
}
