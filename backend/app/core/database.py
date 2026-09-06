from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from app.config import get_settings
from app.models.base import Base
from app.models import DriveSession, RoadNetwork, TelemetryRecord


@dataclass
class TelemetryStore:
    sessions: dict[str, dict[str, Any]] = field(default_factory=dict)
    telemetry: dict[str, list[dict[str, Any]]] = field(default_factory=dict)

    async def start_session(self, session_id: str, metadata: dict[str, Any]) -> dict[str, Any]:
        session = {
            "id": session_id,
            "status": "active",
            "started_at": datetime.now(timezone.utc),
            "stopped_at": None,
            "metadata": metadata,
        }
        self.sessions[session_id] = session
        self.telemetry.setdefault(session_id, [])
        return session

    async def stop_session(self, session_id: str) -> dict[str, Any] | None:
        session = self.sessions.get(session_id)
        if session is None:
            return None
        session["status"] = "stopped"
        session["stopped_at"] = datetime.now(timezone.utc)
        return session

    async def add_telemetry(self, session_id: str, record: dict[str, Any]) -> dict[str, Any]:
        self.telemetry.setdefault(session_id, []).append(record)
        return record

    async def get_telemetry(self, session_id: str) -> list[dict[str, Any]]:
        return self.telemetry.get(session_id, [])


_store = TelemetryStore()
_engine: AsyncEngine | None = None


def get_store() -> TelemetryStore:
    return _store


async def startup_db_client() -> TelemetryStore:
    global _engine
    if _engine is None:
        _engine = create_async_engine(get_settings().database_url, pool_pre_ping=True)
        async with _engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
    return _store


async def shutdown_db_client() -> None:
    global _engine
    if _engine is not None:
        await _engine.dispose()
        _engine = None
