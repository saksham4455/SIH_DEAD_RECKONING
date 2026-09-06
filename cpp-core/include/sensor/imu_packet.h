#pragma once

#include <cstdint>

namespace sih {
struct IMUPacket {
    double ax{0.0};
    double ay{0.0};
    double az{0.0};
    double gx{0.0};
    double gy{0.0};
    double gz{0.0};
    std::uint64_t t{0};
};
}
