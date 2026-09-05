#ifndef SIH_TYPES_H
#define SIH_TYPES_H

#include <cstdint>
#include <string>

namespace sih {
    struct Vector3d {
        double x, y, z;
    };

    struct NavigationState {
        double latitude;
        double longitude;
        double altitude;
        double speed;
        double heading;
        double confidence;
    };
}

#endif // SIH_TYPES_H
