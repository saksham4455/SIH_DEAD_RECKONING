#pragma once

#include "common/types.h"

namespace sih {
void updateBiases(Vector3d& gyroBias, Vector3d& accelerometerBias, const Vector3d& gyro, const Vector3d& acceleration);
void correctRawMeasurements(Vector3d& gyro, Vector3d& acceleration, const Vector3d& gyroBias, const Vector3d& accelerometerBias);
}
