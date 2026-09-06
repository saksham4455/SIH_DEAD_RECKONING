import json
from pathlib import Path


class MapQueryService:
    def __init__(self) -> None:
        self._roads_path = Path(__file__).resolve().parents[3] / "maps" / "demo-region" / "roads.json"

    def query_roads_in_bbox(self, min_lat: float, min_lon: float, max_lat: float, max_lon: float) -> dict:
        if not self._roads_path.exists():
            return {"region": "demo", "roadSegments": []}
        data = json.loads(self._roads_path.read_text(encoding="utf-8"))
        segments = []
        for segment in data.get("roadSegments", []):
            coordinates = segment.get("coordinates", [])
            if any(min_lat <= point[0] <= max_lat and min_lon <= point[1] <= max_lon for point in coordinates):
                segments.append(segment)
        return {"region": data.get("region", "demo"), "roadSegments": segments}
