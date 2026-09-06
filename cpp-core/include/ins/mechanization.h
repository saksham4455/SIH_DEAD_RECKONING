#pragma once

#include "common/types.h"
#include "sensor/imu_packet.h"

namespace sih {
void strapdownIntegration(const IMUPacket& packet, double dt);
Vector3d transformAccelToNavFrame(const Vector3d& bodyAcceleration, const Quaterniond& attitude);
void updateAttitudeQuaternion(Quaterniond& attitude, const Vector3d& angularRate, double dt);
}
