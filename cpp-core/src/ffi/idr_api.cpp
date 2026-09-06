#include "ffi/idr_api.h"

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <mutex>

namespace {
std::mutex state_mutex;
double current_latitude = 28.6139;
double current_longitude = 77.2090;
double current_speed = 12.5;
double current_heading = 145.5;
double current_confidence = 0.95;
double last_timestamp = 0.0;

void update_state_from_imu(double ax, double ay, double timestamp) {
    const double dt = last_timestamp > 0.0 ? std::max(0.0, timestamp - last_timestamp) : 0.0;
    current_speed = std::max(0.0, current_speed + ax * dt);
    if (std::abs(ay) > 1e-6) {
        current_heading = std::fmod(current_heading + ay * dt * 57.295779513, 360.0);
        if (current_heading < 0.0) current_heading += 360.0;
    }
    last_timestamp = timestamp;
    current_confidence = std::max(0.1, current_confidence - dt * 0.001);
}
}

extern "C" {
void IDR_Init() {
    std::lock_guard<std::mutex> lock(state_mutex);
    current_speed = 12.5;
    current_heading = 145.5;
    current_confidence = 0.95;
    last_timestamp = 0.0;
}

void IDR_PushIMU(double ax, double, double, double, double ay, double, std::uint64_t timestamp) {
    std::lock_guard<std::mutex> lock(state_mutex);
    update_state_from_imu(ax, ay, static_cast<double>(timestamp) / 1e9);
}

void IDR_PushGNSS(double lat, double lon, double, double speed, double track, double hdop, int, std::uint64_t) {
    std::lock_guard<std::mutex> lock(state_mutex);
    current_latitude = lat;
    current_longitude = lon;
    current_speed = std::max(0.0, speed);
    current_heading = track;
    current_confidence = std::clamp(1.0 / std::max(1.0, hdop), 0.1, 1.0);
}

void IDR_PushMLSpeed(double forwardSpeed, double confidence) {
    std::lock_guard<std::mutex> lock(state_mutex);
    const double weight = std::clamp(confidence, 0.0, 1.0);
    current_speed = current_speed * (1.0 - weight) + std::max(0.0, forwardSpeed) * weight;
}

void IDR_GetState(double* lat, double* lon, double* speed, double* heading, double* confidence) {
    std::lock_guard<std::mutex> lock(state_mutex);
    if (lat) *lat = current_latitude;
    if (lon) *lon = current_longitude;
    if (speed) *speed = current_speed;
    if (heading) *heading = current_heading;
    if (confidence) *confidence = current_confidence;
}

void idr_init() { IDR_Init(); }

void idr_update_imu(double ax, double ay, double az, double gx, double gy, double gz, double timestamp) {
    IDR_PushIMU(ax, ay, az, gx, gy, gz, static_cast<std::uint64_t>(timestamp * 1e9));
}

void idr_get_navigation_state(double* lat, double* lon, double* speed, double* heading, double* confidence) {
    IDR_GetState(lat, lon, speed, heading, confidence);
}
}