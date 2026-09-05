#ifndef IDR_API_H
#define IDR_API_H

#ifdef __cplusplus
extern "C" {
#endif

void idr_init();
void idr_update_imu(double ax, double ay, double az, double gx, double gy, double gz, double timestamp);
void idr_get_navigation_state(double* lat, double* lon, double* speed, double* heading, double* confidence);

#ifdef __cplusplus
}
#endif

#endif // IDR_API_H
