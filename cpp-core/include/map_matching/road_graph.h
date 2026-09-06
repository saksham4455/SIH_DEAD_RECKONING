#pragma once

#include <string>
#include <vector>

namespace sih {
struct RoadSegment {
    std::string id;
    std::vector<double> coordinates;
};
std::vector<RoadSegment> loadGraphFromBinary(const std::string& path);
std::vector<RoadSegment> querySpatialProximity(double latitude, double longitude, double radiusMeters);
}
