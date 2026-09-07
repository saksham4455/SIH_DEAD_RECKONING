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


class TelemetryEvent(BaseModel):
    """Canonical real-time event contract published to Redis and WebSocket clients."""

    type: str = "telemetry"
    session_id: str
    timestamp: datetime
    latitude: float
    longitude: float
    altitude: float | None = None
    speed: float = 0.0
    heading: float = 0.0
    confidence: float = 0.0
    gnss_available: bool = True
    mode: str = "GNSS_LOCKED"


def serialize_telemetry_event(record: TelemetryOut | TelemetryIn) -> dict:
    """Format a telemetry record into the canonical JSON-serializable Redis event."""
    return TelemetryEvent(
        type="telemetry",
        session_id=record.session_id,
        timestamp=record.timestamp,
        latitude=record.latitude,
        longitude=record.longitude,
        altitude=record.altitude,
        speed=record.speed,
        heading=record.heading,
        confidence=record.confidence,
        gnss_available=record.gnss_available,
        mode=record.mode,
    ).model_dump(mode="json")
