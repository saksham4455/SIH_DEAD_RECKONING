#include "map_matching/road_graph.h"
#include "map_matching/hmm_matcher.h"

namespace sih {
std::vector<RoadSegment> loadGraphFromBinary(const std::string&) { return {}; }
std::vector<RoadSegment> querySpatialProximity(double, double, double) { return {}; }
double calculateEmissionProbability(const RoadSegment&, double, double) { return 0.0; }
RoadSegment findOptimalSegmentViterbi(const std::vector<RoadSegment>& candidates) { return candidates.empty() ? RoadSegment{} : candidates.front(); }
}
