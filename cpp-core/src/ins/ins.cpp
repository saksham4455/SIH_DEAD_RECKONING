#include "ins/mechanization.h"
#include "ins/bias_tracker.h"
#include "ins/earth_model.h"

namespace sih {
void strapdownIntegration(const IMUPacket&, double) {}
Vector3d transformAccelToNavFrame(const Vector3d& bodyAcceleration, const Quaterniond&) { return bodyAcceleration; }
void updateAttitudeQuaternion(Quaterniond&, const Vector3d&, double) {}
void updateBiases(Vector3d&, Vector3d&, const Vector3d&, const Vector3d&) {}
void correctRawMeasurements(Vector3d& gyro, Vector3d& acceleration, const Vector3d& gyroBias, const Vector3d& accelerometerBias) { gyro.x -= gyroBias.x; gyro.y -= gyroBias.y; gyro.z -= gyroBias.z; acceleration.x -= accelerometerBias.x; acceleration.y -= accelerometerBias.y; acceleration.z -= accelerometerBias.z; }
double calculateSomiglianaGravity(double, double altitude) { return 9.80665 - 3.086e-6 * altitude; }
Vector3d computeCoriolisCorrection(const Vector3d&, double) { return {}; }
}
