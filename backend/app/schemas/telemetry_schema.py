from datetime import datetime
from pydantic import BaseModel, Field


class TelemetryIn(BaseModel):
    session_id: str
    timestamp: datetime
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    altitude: float | None = None
    speed: float = Field(default=0, ge=0)
    heading: float = Field(default=0, ge=0, lt=360)
    confidence: float = Field(default=0, ge=0, le=1)
    gnss_available: bool = True
    mode: str = "GNSS_LOCKED"


class TelemetryOut(TelemetryIn):
    received_at: datetime


class TelemetryBatch(BaseModel):
    records: list[TelemetryIn] = Field(min_length=1, max_length=1000)
