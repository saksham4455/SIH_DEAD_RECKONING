from collections.abc import AsyncGenerator
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from geoalchemy2 import Geometry
from geoalchemy2.admin.dialects import sqlite as geo_sqlite
from sqlalchemy import event
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

# Enable seamless SQLite local dev fallback without SpatiaLite C extensions
geo_sqlite.before_create = lambda *a, **k: None
geo_sqlite.after_create = lambda *a, **k: None

@compiles(Geometry, "sqlite")
def compile_geom_sqlite(type_, compiler, **kw):
    return "TEXT"


from app.config import get_settings
from app.models.base import Base
from app.models import DriveSession, RoadNetwork, TelemetryRecord


@dataclass
class TelemetryStore:
    """In-memory telemetry store retained strictly for mock/compatibility fallback.

    Operational persistence for sessions and telemetry has been fully migrated to
    PostgreSQL/PostGIS via AsyncSession, get_db, and service layers.
    """
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
        db_url = get_settings().database_url
        _engine = create_async_engine(db_url, pool_pre_ping=True)
        if "sqlite" in db_url:
            @event.listens_for(_engine.sync_engine, "connect")
            def _set_sqlite_udfs(dbapi_conn, record):
                def _to_ewkb(val):
                    if not val:
                        return val
                    try:
                        from shapely import wkt, wkb
                        val_str = str(val)
                        if ";" in val_str:
                            val_str = val_str.split(";")[-1]
                        return wkb.dumps(wkt.loads(val_str), srid=4326, hex=True)
                    except Exception:
                        return val

                try:
                    dbapi_conn.execute("PRAGMA foreign_keys=ON")
                    dbapi_conn.create_function("GeomFromEWKT", 1, lambda val: val)
                    dbapi_conn.create_function("ST_GeomFromEWKT", 1, lambda val: val)
                    dbapi_conn.create_function("AsEWKB", 1, _to_ewkb)
                    dbapi_conn.create_function("ST_AsEWKB", 1, _to_ewkb)
                    dbapi_conn.create_function("AsBinary", 1, _to_ewkb)
                    dbapi_conn.create_function("ST_AsBinary", 1, _to_ewkb)
                    dbapi_conn.create_function("RecoverGeometryColumn", 5, lambda *args: 1)
                    dbapi_conn.create_function("CreateSpatialIndex", 2, lambda *args: 1)
                    dbapi_conn.create_function("DisableSpatialIndex", 2, lambda *args: 1)
                    dbapi_conn.create_function("InitSpatialMetaData", 0, lambda: 1)
                    dbapi_conn.create_function("InitSpatialMetaData", 1, lambda val: 1)
                except Exception:
                    pass


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
    """Initialize database engine and ensure tables exist."""
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    return _store


async def shutdown_db_client() -> None:
    """Dispose database engine on application shutdown."""
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
        _engine = None
        _session_factory = None
