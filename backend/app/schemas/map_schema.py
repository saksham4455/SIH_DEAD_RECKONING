from pydantic import BaseModel, Field


class CorridorQuery(BaseModel):
    min_lat: float = Field(ge=-90, le=90)
    min_lon: float = Field(ge=-180, le=180)
    max_lat: float = Field(ge=-90, le=90)
    max_lon: float = Field(ge=-180, le=180)


class RoadSegment(BaseModel):
    id: str
    name: str | None = None
    speedLimitKmh: float | None = None
    coordinates: list[list[float]] = Field(default_factory=list)


class CorridorResponse(BaseModel):
    region: str
    roadSegments: list[RoadSegment]


class MapUploadResponse(BaseModel):
    filename: str
    path: str
    size_bytes: int
