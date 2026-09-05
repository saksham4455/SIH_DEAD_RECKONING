#include "idr_api.h"

static double current_lat = 28.6139;
static double current_lon = 77.2090;
static double current_speed = 12.5;
static double current_heading = 145.5;
static double current_confidence = 0.95;

void idr_init() {}

void idr_update_imu(double ax, double ay, double az, double gx, double gy, double gz, double timestamp) {}

void idr_get_navigation_state(double* lat, double* lon, double* speed, double* heading, double* confidence) {
    if (lat) *lat = current_lat;
    if (lon) *lon = current_lon;
    if (speed) *speed = current_speed;
    if (heading) *heading = current_heading;
    if (confidence) *confidence = current_confidence;
}
