#pragma once

#include "common/types.h"

namespace sih {
Vector3d geodeticToECEF(double latitude, double longitude, double altitude);
Vector3d ecefToNED(const Vector3d& ecef, const Vector3d& reference);
Vector3d nedToGeodetic(const Vector3d& ned, const Vector3d& reference);
Matrix3d eulerToDCM(const Vector3d& euler);
}
