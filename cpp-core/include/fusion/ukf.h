#pragma once

#include "sensor/gnss_packet.h"

namespace sih {
class UKF {
public:
    void predict(double dt);
    void updateGNSS(const GNSSPacket& gnss);
    void updateZUPT();
    void updateMLSpeed(double forwardSpeed, double confidence);
};
}
