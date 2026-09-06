from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.websockets.ws_manager import ConnectionManager
from app.core.database import TelemetryStore, get_store
from app.schemas.telemetry_schema import TelemetryBatch, TelemetryIn, TelemetryOut

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


def store() -> TelemetryStore:
    return get_store()


@router.post("", response_model=TelemetryOut, status_code=status.HTTP_201_CREATED)
async def ingest_telemetry(payload: TelemetryIn, request: Request, database: TelemetryStore = Depends(store)) -> TelemetryOut:
    if payload.session_id not in database.sessions:
        raise HTTPException(status_code=404, detail="Session was not found")
    record = payload.model_dump()
    record["received_at"] = datetime.now(timezone.utc)
    await database.add_telemetry(payload.session_id, record)
    manager: ConnectionManager = request.app.state.ws_manager
    await manager.broadcast(record)
    return TelemetryOut(**record)


@router.post("/batch", response_model=list[TelemetryOut], status_code=status.HTTP_201_CREATED)
async def ingest_telemetry_batch(payload: TelemetryBatch, request: Request, database: TelemetryStore = Depends(store)) -> list[TelemetryOut]:
    results = []
    for record in payload.records:
        results.append(await ingest_telemetry(record, request, database))
    return results


@router.get("/session/{session_id}", response_model=list[TelemetryOut])
async def get_session_telemetry(session_id: str, database: TelemetryStore = Depends(store)) -> list[TelemetryOut]:
    if session_id not in database.sessions:
        raise HTTPException(status_code=404, detail="Session was not found")
    return [TelemetryOut(**record) for record in await database.get_telemetry(session_id)]
