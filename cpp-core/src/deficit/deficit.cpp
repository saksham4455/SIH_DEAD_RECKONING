#include "deficit/outage_detector.h"
#include "deficit/state_machine.h"
#include "deficit/dead_reckoning.h"

namespace sih {
bool evaluateSignalIntegrity(const GNSSPacket& gnss) { return gnss.svs > 0 && gnss.hdop < 10.0; }
bool detectMultipathAnomaly(const GNSSPacket& gnss) { return gnss.hdop > 5.0; }
NavigationMode transitionMode(NavigationMode current, bool gnssAvailable) { return gnssAvailable ? NavigationMode::Gnss : NavigationMode::DeadReckoning; }
void propagateDeadReckoning(double) {}
void inflateCovarianceOverTime(double) {}
}
