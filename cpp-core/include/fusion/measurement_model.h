#pragma once

#include "sensor/gnss_packet.h"

namespace sih {
void h_GNSS(const GNSSPacket& gnss);
void h_ZUPT();
void h_Kinematic();
}
