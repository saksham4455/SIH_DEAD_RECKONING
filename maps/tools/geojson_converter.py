"""GeoJSON export boundary for Flutter map rendering."""

import json
from pathlib import Path


def exportToGeoJSON(graph, output_path):
    path = Path(output_path)
    feature_collection = {
        "type": "FeatureCollection",
        "features": graph.get("features", []),
    }
    path.write_text(json.dumps(feature_collection, indent=2), encoding="utf-8")
    return path
