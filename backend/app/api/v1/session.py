from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException

from app.core.database import TelemetryStore, get_store
from app.schemas.session_schema import SessionResponse, SessionStartRequest, SessionSummary
from app.services.drift_analyzer import calculate_drift_percentage, compute_max_absolute_error, compute_rmse

router = APIRouter(prefix="/session", tags=["sessions"])


def store() -> TelemetryStore:
    return get_store()


@router.post("/start", response_model=SessionResponse)
async def start_session(payload: SessionStartRequest, database: TelemetryStore = Depends(store)) -> SessionResponse:
    session = await database.start_session(str(uuid4()), payload.metadata)
    return SessionResponse(**session)


@router.post("/{session_id}/stop", response_model=SessionResponse)
async def stop_session(session_id: str, database: TelemetryStore = Depends(store)) -> SessionResponse:
    session = await database.stop_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session was not found")
    return SessionResponse(**session)


@router.get("/{session_id}/summary", response_model=SessionSummary)
async def session_summary(session_id: str, database: TelemetryStore = Depends(store)) -> SessionSummary:
    session = database.sessions.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session was not found")
    records = await database.get_telemetry(session_id)
    stopped_at = session["stopped_at"] or datetime.now(timezone.utc)
    duration = (stopped_at - session["started_at"]).total_seconds()
    return SessionSummary(
        **session,
        telemetry_count=len(records),
        duration_seconds=max(0.0, duration),
        drift_rmse=compute_rmse(records),
        max_absolute_error=compute_max_absolute_error(records),
        drift_percentage=calculate_drift_percentage(records),
    )
