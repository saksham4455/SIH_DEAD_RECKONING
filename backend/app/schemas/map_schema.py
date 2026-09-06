from pydantic import BaseModel, Field


class CorridorQuery(BaseModel):
    min_lat: float = Field(ge=-90, le=90)
    min_lon: float = Field(ge=-180, le=180)
    max_lat: float = Field(ge=-90, le=90)
    max_lon: float = Field(ge=-180, le=180)


class MapUploadResponse(BaseModel):
    filename: str
    path: str
    size_bytes: int
