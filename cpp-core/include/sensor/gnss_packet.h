#pragma once

#include <cstdint>

namespace sih {
struct GNSSPacket {
    double lat{0.0};
    double lon{0.0};
    double alt{0.0};
    double speed{0.0};
    double track{0.0};
    double hdop{0.0};
    int svs{0};
    std::uint64_t t{0};
};
}
