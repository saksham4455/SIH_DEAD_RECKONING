#pragma once

#include "common/types.h"

namespace sih {
Quaterniond computeInitialAttitude(const Vector3d& meanAcceleration, const Vector3d& magneticField);
Vector3d estimateStaticGyroBias(const Vector3d& meanGyroscope);
}
