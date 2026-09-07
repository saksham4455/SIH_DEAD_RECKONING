from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.websockets.ws_manager import ConnectionManager
from app.core.database import get_db
from app.schemas.telemetry_schema import TelemetryBatch, TelemetryIn, TelemetryOut
from app.services import telemetry_service

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


@router.post("", response_model=TelemetryOut, status_code=status.HTTP_201_CREATED)
async def ingest_telemetry(
    payload: TelemetryIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> TelemetryOut:
    result = await telemetry_service.insert_telemetry(db, payload)
    manager: ConnectionManager | None = getattr(request.app.state, "ws_manager", None)
    if manager is not None:
        await manager.broadcast(result.model_dump(mode="json"))
    return result


@router.post("/batch", response_model=list[TelemetryOut], status_code=status.HTTP_201_CREATED)
async def ingest_telemetry_batch(
    payload: TelemetryBatch,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> list[TelemetryOut]:
    results = await telemetry_service.insert_telemetry_batch(db, payload.records)
    manager: ConnectionManager | None = getattr(request.app.state, "ws_manager", None)
    if manager is not None:
        for item in results:
            await manager.broadcast(item.model_dump(mode="json"))
    return results


@router.get("/session/{session_id}", response_model=list[TelemetryOut])
async def get_session_telemetry(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> list[TelemetryOut]:
    return await telemetry_service.get_session_telemetry(db, session_id)
