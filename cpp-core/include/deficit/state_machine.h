#pragma once

namespace sih {
enum class NavigationMode { Gnss, Degraded, DeadReckoning, Reacquiring };
NavigationMode transitionMode(NavigationMode current, bool gnssAvailable);
}
