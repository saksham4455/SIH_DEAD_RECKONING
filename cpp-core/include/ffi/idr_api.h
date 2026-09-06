#ifndef SIH_IDR_API_H
#define SIH_IDR_API_H

#include <stdint.h>

#if defined(_WIN32)
#define IDR_EXPORT __declspec(dllexport)
#else
#define IDR_EXPORT __attribute__((visibility("default")))
#endif

#ifdef __cplusplus
extern "C" {
#endif

IDR_EXPORT void IDR_Init();
IDR_EXPORT void IDR_PushIMU(double ax, double ay, double az, double gx, double gy, double gz, uint64_t timestamp);
IDR_EXPORT void IDR_PushGNSS(double lat, double lon, double alt, double speed, double track, double hdop, int svs, uint64_t timestamp);
IDR_EXPORT void IDR_PushMLSpeed(double forwardSpeed, double confidence);
IDR_EXPORT void IDR_GetState(double* lat, double* lon, double* speed, double* heading, double* confidence);

IDR_EXPORT void idr_init();
IDR_EXPORT void idr_update_imu(double ax, double ay, double az, double gx, double gy, double gz, double timestamp);
IDR_EXPORT void idr_get_navigation_state(double* lat, double* lon, double* speed, double* heading, double* confidence);

#ifdef __cplusplus
}
#endif

#endif