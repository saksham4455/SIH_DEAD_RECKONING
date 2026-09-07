from collections.abc import AsyncGenerator
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

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

    async def get_session(self, session_id: str) -> dict[str, Any] | None:
        return self.sessions.get(session_id)

    async def session_exists(self, session_id: str) -> bool:
        return session_id in self.sessions


_store = TelemetryStore()
_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_store() -> TelemetryStore:
    return _store


def get_engine() -> AsyncEngine:
    global _engine, _session_factory
    if _engine is None:
        _engine = create_async_engine(get_settings().database_url, pool_pre_ping=True)
        _session_factory = async_sessionmaker(_engine, expire_on_commit=False)
    return _engine


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding an AsyncSession. Closes/releases upon completion."""
    global _session_factory
    if _session_factory is None:
        get_engine()
    assert _session_factory is not None
    async with _session_factory() as session:
        yield session


async def startup_db_client() -> TelemetryStore:
    """Initialize database engine without running create_all (managed via Alembic)."""
    get_engine()
    return _store


async def shutdown_db_client() -> None:
    """Dispose database engine on application shutdown."""
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
        _engine = None
        _session_factory = None
