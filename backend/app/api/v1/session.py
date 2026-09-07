from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.session_schema import SessionResponse, SessionStartRequest, SessionSummary
from app.services import session_service, telemetry_service

router = APIRouter(prefix="/session", tags=["sessions"])


@router.post("/start", response_model=SessionResponse)
async def start_session(
    payload: SessionStartRequest,
    db: AsyncSession = Depends(get_db),
) -> SessionResponse:
    session = await session_service.create_session(db, payload.metadata)
    return SessionResponse(
        id=session.id,
        status=session.status,
        started_at=session.started_at,
        stopped_at=session.stopped_at,
        metadata=session.metadata_json or {},
    )


@router.post("/{session_id}/stop", response_model=SessionResponse)
async def stop_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> SessionResponse:
    session = await session_service.stop_session(db, session_id)
    return SessionResponse(
        id=session.id,
        status=session.status,
        started_at=session.started_at,
        stopped_at=session.stopped_at,
        metadata=session.metadata_json or {},
    )


@router.get("/{session_id}/summary", response_model=SessionSummary)
async def session_summary(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> SessionSummary:
    return await telemetry_service.get_session_summary(db, session_id)
