from datetime import datetime
from pydantic import BaseModel, Field


class SessionStartRequest(BaseModel):
    metadata: dict = Field(default_factory=dict)


class SessionResponse(BaseModel):
    id: str
    status: str
    started_at: datetime
    stopped_at: datetime | None = None
    metadata: dict


class SessionSummary(SessionResponse):
    telemetry_count: int
    duration_seconds: float
    drift_rmse: float
    max_absolute_error: float
    drift_percentage: float
