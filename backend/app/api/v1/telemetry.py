import logging
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.websockets.ws_manager import ConnectionManager
from app.config import get_settings
from app.core.database import get_db
from app.core.redis_client import publish_telemetry_event
from app.schemas.telemetry_schema import (
    TelemetryBatch,
    TelemetryIn,
    TelemetryOut,
    serialize_telemetry_event,
)
from app.services import telemetry_service

logger = logging.getLogger("backend.api.telemetry")

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


@router.post("", response_model=TelemetryOut, status_code=status.HTTP_201_CREATED)
async def ingest_telemetry(
    payload: TelemetryIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> TelemetryOut:
    # 1. Authoritative persistence: insert and commit to PostgreSQL
    result = await telemetry_service.insert_telemetry(db, payload)

    # 2. Real-time event transport post-commit
    redis_client = getattr(request.app.state, "redis_client", None)
    settings = get_settings()
    event = serialize_telemetry_event(result)

    if redis_client is not None:
        # Publish to Redis channel; Redis failure is auxiliary and never fails persistence
        await publish_telemetry_event(
            channel=settings.redis_telemetry_channel,
            event=event,
            client=redis_client,
        )
    else:
        # Fallback to direct WebSocket broadcast only when Redis is genuinely disabled/unavailable
        manager: ConnectionManager | None = getattr(request.app.state, "ws_manager", None)
        if manager is not None:
            await manager.broadcast(event)

    return result


@router.post("/batch", response_model=list[TelemetryOut], status_code=status.HTTP_201_CREATED)
async def ingest_telemetry_batch(
    payload: TelemetryBatch,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> list[TelemetryOut]:
    # 1. Authoritative persistence: insert and commit all batch records in a single transaction
    results = await telemetry_service.insert_telemetry_batch(db, payload.records)

    # 2. Real-time event transport post-commit
    redis_client = getattr(request.app.state, "redis_client", None)
    settings = get_settings()

    if redis_client is not None:
        for item in results:
            event = serialize_telemetry_event(item)
            await publish_telemetry_event(
                channel=settings.redis_telemetry_channel,
                event=event,
                client=redis_client,
            )
    else:
        # Fallback to direct WebSocket broadcast only when Redis is genuinely disabled/unavailable
        manager: ConnectionManager | None = getattr(request.app.state, "ws_manager", None)
        if manager is not None:
            for item in results:
                event = serialize_telemetry_event(item)
                await manager.broadcast(event)

    return results


@router.get("/session/{session_id}", response_model=list[TelemetryOut])
async def get_session_telemetry(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> list[TelemetryOut]:
    return await telemetry_service.get_session_telemetry(db, session_id)
