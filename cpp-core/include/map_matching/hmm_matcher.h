#pragma once

#include "map_matching/road_graph.h"

namespace sih {
double calculateEmissionProbability(const RoadSegment& segment, double latitude, double longitude);
RoadSegment findOptimalSegmentViterbi(const std::vector<RoadSegment>& candidates);
}
