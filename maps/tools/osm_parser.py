"""OpenStreetMap input and drivable-road filtering boundaries."""


def parsePbfFile(path):
    raise NotImplementedError("PBF parsing requires the selected OSM parser dependency")


def filter_drivable_roads(elements):
    return [element for element in elements if element.get("highway") not in {"footway", "cycleway", "path"}]


def cleanDisconnectedComponents(graph):
    return graph
