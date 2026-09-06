#include "common/timestamp.h"

#include <chrono>

namespace sih {
std::uint64_t monotonicTimestampNs() {
    return static_cast<std::uint64_t>(std::chrono::duration_cast<std::chrono::nanoseconds>(std::chrono::steady_clock::now().time_since_epoch()).count());
}
}
