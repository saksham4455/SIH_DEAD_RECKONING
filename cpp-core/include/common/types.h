#ifndef SIH_TYPES_H
#define SIH_TYPES_H

#include <cstdint>
#include <array>

namespace sih {
    struct Vector3d {
        double x{0.0};
        double y{0.0};
        double z{0.0};
    };

    using Matrix3d = std::array<double, 9>;
    using Quaterniond = std::array<double, 4>;
    using StateVector15d = std::array<double, 15>;

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
