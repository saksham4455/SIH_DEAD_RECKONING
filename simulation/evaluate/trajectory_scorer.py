"""Trajectory comparison and reporting boundaries."""


def compareTrajectories(reference, estimate):
    return {
        "max_deviation": computeMaxDeviation(reference, estimate),
        "sample_count": min(len(reference), len(estimate)),
    }


def computeMaxDeviation(reference, estimate):
    deviations = []
    for expected, actual in zip(reference, estimate):
        expected_lat = expected.get("latitude", 0.0)
        expected_lon = expected.get("longitude", 0.0)
        actual_lat = actual.get("latitude", 0.0)
        actual_lon = actual.get("longitude", 0.0)
        deviations.append(((actual_lat - expected_lat) ** 2 + (actual_lon - expected_lon) ** 2) ** 0.5)
    return max(deviations, default=0.0)


def generatePDFReport(results, output_path):
    raise NotImplementedError("PDF reporting is pending evaluation tooling integration")
