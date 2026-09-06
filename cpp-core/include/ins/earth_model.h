#pragma once

#include "common/types.h"

namespace sih {
double calculateSomiglianaGravity(double latitude, double altitude);
Vector3d computeCoriolisCorrection(const Vector3d& velocity, double latitude);
}
