#include "common/math_utils.h"

#include <cmath>

namespace sih {
Vector3d geodeticToECEF(double latitude, double longitude, double altitude) {
    constexpr double radius = 6378137.0;
    const double lat = latitude * 0.017453292519943295;
    const double lon = longitude * 0.017453292519943295;
    const double distance = radius + altitude;
    return {distance * std::cos(lat) * std::cos(lon), distance * std::cos(lat) * std::sin(lon), distance * std::sin(lat)};
}

Vector3d ecefToNED(const Vector3d& ecef, const Vector3d& reference) {
    return {ecef.x - reference.x, ecef.y - reference.y, ecef.z - reference.z};
}

Vector3d nedToGeodetic(const Vector3d& ned, const Vector3d& reference) {
    return {reference.x + ned.x, reference.y + ned.y, reference.z + ned.z};
}

Matrix3d eulerToDCM(const Vector3d& euler) {
    const double cr = std::cos(euler.x), sr = std::sin(euler.x);
    const double cp = std::cos(euler.y), sp = std::sin(euler.y);
    const double cy = std::cos(euler.z), sy = std::sin(euler.z);
    return {cy * cp, cy * sp * sr - sy * cr, cy * sp * cr + sy * sr,
            sy * cp, sy * sp * sr + cy * cr, sy * sp * cr - cy * sr,
            -sp, cp * sr, cp * cr};
}
}
