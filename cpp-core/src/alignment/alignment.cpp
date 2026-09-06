#include "alignment/static_leveling.h"
#include "alignment/forward_axis_estimator.h"
#include "alignment/orientation_tracker.h"

namespace sih {
Quaterniond computeInitialAttitude(const Vector3d&, const Vector3d&) { return {1.0, 0.0, 0.0, 0.0}; }
Vector3d estimateStaticGyroBias(const Vector3d& meanGyroscope) { return meanGyroscope; }
void updateAccelerationWindow(const Vector3d&) {}
Vector3d getVehicleForwardAxis() { return {1.0, 0.0, 0.0}; }
Matrix3d getBodyToChassisRotationMatrix() { return {1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0}; }
}
