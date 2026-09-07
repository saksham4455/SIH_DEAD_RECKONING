"""Phase 3 Persistence Validation Tests.

Validates the 8 core operational persistence requirements:
1. Create session -> persisted row in database
2. Stop session -> persisted status='stopped' and stopped_at
3. Single telemetry -> persisted row with geometry
4. Batch telemetry -> all records persist in single transaction
5. Invalid session -> rejected with SessionNotFoundError
6. Session telemetry -> strictly ordered by timestamp ASC
7. Session deletion -> telemetry cascade deletion
8. Session summary -> calculations accurately use persisted telemetry
"""

import asyncio
from datetime import datetime, timedelta, timezone
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
import pytest_asyncio
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import app.core.database  # Activates SQLite geometry compiler & UDF hooks
from app.core.exceptions import SessionNotFoundError

from app.models.base import Base
from app.models.drive_session import DriveSession
from app.models.telemetry_record import TelemetryRecord
from app.schemas.telemetry_schema import TelemetryIn
from app.services import session_service, telemetry_service


from geoalchemy2.admin.dialects import sqlite as geo_sqlite

geo_sqlite.before_create = lambda *a, **k: None
geo_sqlite.after_create = lambda *a, **k: None


def setup_sqlite_engine(engine):
    """Attach SQLite hooks and spatial functions for isolated local tests."""
    from sqlalchemy import event

    @event.listens_for(engine.sync_engine, "connect")
    def _set_sqlite_hooks(dbapi_conn, record):
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
    return engine


@pytest_asyncio.fixture
async def async_db():
    """Create an isolated in-memory test database with PostGIS/SQLite compatibility."""
    engine = setup_sqlite_engine(create_async_engine("sqlite+aiosqlite:///:memory:", echo=False))

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()




@pytest.mark.asyncio
async def test_1_create_session(async_db: AsyncSession):
    """1. Create session -> verify database row exists."""
    metadata = {"vehicle": "KA-01-AB-1234", "pilot": "Unit Tester"}
    session = await session_service.create_session(async_db, metadata)

    assert session.id is not None
    assert session.status == "active"
    assert session.stopped_at is None
    assert session.metadata_json == metadata

    # Verify directly from DB query
    stmt = select(DriveSession).where(DriveSession.id == session.id)
    persisted = (await async_db.execute(stmt)).scalar_one_or_none()
    assert persisted is not None
    assert persisted.id == session.id
    assert persisted.status == "active"


@pytest.mark.asyncio
async def test_2_stop_session(async_db: AsyncSession):
    """2. Stop session -> verify stopped_at and status updated in DB."""
    session = await session_service.create_session(async_db, {"test": True})
    stopped = await session_service.stop_session(async_db, session.id)

    assert stopped.status == "stopped"
    assert stopped.stopped_at is not None
    assert stopped.stopped_at >= session.started_at

    # Verify query
    persisted = await session_service.get_session(async_db, session.id)
    assert persisted is not None
    assert persisted.status == "stopped"
    assert persisted.stopped_at is not None


@pytest.mark.asyncio
async def test_3_insert_single_telemetry(async_db: AsyncSession):
    """3. Insert single telemetry -> verify database row exists and geom populated."""
    session = await session_service.create_session(async_db, {})
    now = datetime.now(timezone.utc)

    payload = TelemetryIn(
        session_id=session.id,
        timestamp=now,
        latitude=12.9716,
        longitude=77.5946,
        altitude=920.0,
        speed=15.5,
        heading=180.0,
        confidence=0.95,
        gnss_available=True,
        mode="GNSS_LOCKED",
    )
    result = await telemetry_service.insert_telemetry(async_db, payload)

    assert result.session_id == session.id
    assert result.latitude == 12.9716
    assert result.longitude == 77.5946

    # Verify row in telemetry_records table
    stmt = select(TelemetryRecord).where(TelemetryRecord.session_id == session.id)
    record = (await async_db.execute(stmt)).scalar_one_or_none()
    assert record is not None
    assert record.speed == 15.5
    assert record.geom is not None


@pytest.mark.asyncio
async def test_4_insert_batch_telemetry(async_db: AsyncSession):
    """4. Insert batch telemetry -> verify all records persist in single transaction."""
    session = await session_service.create_session(async_db, {})
    base_time = datetime.now(timezone.utc)

    batch = [
        TelemetryIn(
            session_id=session.id,
            timestamp=base_time + timedelta(seconds=i),
            latitude=12.9716 + (i * 0.0001),
            longitude=77.5946 + (i * 0.0001),
            speed=10.0 + i,
            heading=90.0,
            confidence=0.9,
            gnss_available=True,
            mode="GNSS_LOCKED",
        )
        for i in range(10)
    ]

    results = await telemetry_service.insert_telemetry_batch(async_db, batch)
    assert len(results) == 10

    stmt = select(TelemetryRecord).where(TelemetryRecord.session_id == session.id)
    all_rows = (await async_db.execute(stmt)).scalars().all()
    assert len(all_rows) == 10


@pytest.mark.asyncio
async def test_5_invalid_session_rejected(async_db: AsyncSession):
    """5. Invalid session -> rejected cleanly with SessionNotFoundError."""
    invalid_id = "non-existent-session-id"

    # Single telemetry rejection
    with pytest.raises(SessionNotFoundError):
        await telemetry_service.insert_telemetry(
            async_db,
            TelemetryIn(
                session_id=invalid_id,
                timestamp=datetime.now(timezone.utc),
                latitude=12.0,
                longitude=77.0,
            ),
        )

    # Batch telemetry rejection
    with pytest.raises(SessionNotFoundError):
        await telemetry_service.insert_telemetry_batch(
            async_db,
            [
                TelemetryIn(
                    session_id=invalid_id,
                    timestamp=datetime.now(timezone.utc),
                    latitude=12.0,
                    longitude=77.0,
                )
            ],
        )

    # Stop session rejection
    with pytest.raises(SessionNotFoundError):
        await session_service.stop_session(async_db, invalid_id)


@pytest.mark.asyncio
async def test_6_telemetry_retrieval_ordered(async_db: AsyncSession):
    """6. Retrieve session telemetry -> strictly ordered by timestamp ASC."""
    session = await session_service.create_session(async_db, {})
    t0 = datetime(2026, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
    t1 = t0 + timedelta(seconds=10)
    t2 = t0 + timedelta(seconds=20)
    t3 = t0 + timedelta(seconds=30)

    # Insert out-of-order: t2, t0, t3, t1
    shuffled_batch = [
        TelemetryIn(session_id=session.id, timestamp=t2, latitude=12.2, longitude=77.2),
        TelemetryIn(session_id=session.id, timestamp=t0, latitude=12.0, longitude=77.0),
        TelemetryIn(session_id=session.id, timestamp=t3, latitude=12.3, longitude=77.3),
        TelemetryIn(session_id=session.id, timestamp=t1, latitude=12.1, longitude=77.1),
    ]
    await telemetry_service.insert_telemetry_batch(async_db, shuffled_batch)

    retrieved = await telemetry_service.get_session_telemetry(async_db, session.id)
    assert len(retrieved) == 4
    timestamps = [r.timestamp for r in retrieved]
    assert timestamps == [t0, t1, t2, t3]


@pytest.mark.asyncio
async def test_7_session_deletion_cascade(async_db: AsyncSession):
    """7. Delete session -> telemetry cascade behavior removes associated records."""
    session = await session_service.create_session(async_db, {})
    now = datetime.now(timezone.utc)
    await telemetry_service.insert_telemetry(
        async_db,
        TelemetryIn(session_id=session.id, timestamp=now, latitude=12.0, longitude=77.0),
    )

    # Verify record exists
    stmt = select(TelemetryRecord).where(TelemetryRecord.session_id == session.id)
    records = (await async_db.execute(stmt)).scalars().all()
    assert len(records) == 1

    # Delete session
    del_stmt = delete(DriveSession).where(DriveSession.id == session.id)
    await async_db.execute(del_stmt)
    await async_db.commit()

    # Verify telemetry is also removed
    records_after = (await async_db.execute(stmt)).scalars().all()
    assert len(records_after) == 0


@pytest.mark.asyncio
async def test_8_session_summary_persisted(async_db: AsyncSession):
    """8. Session summary -> accurately calculates drift metrics using persisted telemetry."""
    session = await session_service.create_session(async_db, {})
    now = datetime.now(timezone.utc)

    # Insert records: 2 GNSS_LOCKED, 1 DEAD_RECKONING
    records = [
        TelemetryIn(
            session_id=session.id,
            timestamp=now + timedelta(seconds=1),
            latitude=12.0,
            longitude=77.0,
            confidence=1.0,
            mode="GNSS_LOCKED",
        ),
        TelemetryIn(
            session_id=session.id,
            timestamp=now + timedelta(seconds=2),
            latitude=12.001,
            longitude=77.001,
            confidence=0.8,
            mode="DEAD_RECKONING",
        ),
        TelemetryIn(
            session_id=session.id,
            timestamp=now + timedelta(seconds=3),
            latitude=12.002,
            longitude=77.002,
            confidence=1.0,
            mode="GNSS_LOCKED",
        ),
    ]
    await telemetry_service.insert_telemetry_batch(async_db, records)
    await session_service.stop_session(async_db, session.id)

    summary = await telemetry_service.get_session_summary(async_db, session.id)
    assert summary.id == session.id
    assert summary.telemetry_count == 3
    assert summary.status == "stopped"
    assert summary.duration_seconds >= 0.0
    # 1 out of 3 records is DEAD_RECKONING -> drift percentage ~ 33.33%
    assert abs(summary.drift_percentage - 33.333) < 0.1
    # max absolute error: 1 - 0.8 = 0.2
    assert abs(summary.max_absolute_error - 0.2) < 0.001


@pytest.mark.asyncio
async def test_9_restart_persistence(tmp_path):
    """9. Restart persistence: prove data survives full engine/connection shutdown."""
    db_file = tmp_path / "restart_test.db"
    db_url = f"sqlite+aiosqlite:///{db_file}"

    # Phase A: First process lifetime - create and persist
    engine_1 = setup_sqlite_engine(create_async_engine(db_url, echo=False))
    async with engine_1.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    factory_1 = async_sessionmaker(engine_1, expire_on_commit=False)
    async with factory_1() as session_1:
        created = await session_service.create_session(session_1, {"run": "first_process"})
        session_id = created.id
        await telemetry_service.insert_telemetry(
            session_1,
            TelemetryIn(
                session_id=session_id,
                timestamp=datetime.now(timezone.utc),
                latitude=28.6139,
                longitude=77.2090,
                speed=22.5,
                mode="DEAD_RECKONING",
                confidence=0.85,
            ),
        )

    # Full shutdown / process restart simulation
    await engine_1.dispose()

    # Phase B: Second process lifetime - completely new engine & session factory
    engine_2 = setup_sqlite_engine(create_async_engine(db_url, echo=False))
    factory_2 = async_sessionmaker(engine_2, expire_on_commit=False)
    async with factory_2() as session_2:
        reloaded_session = await session_service.get_session(session_2, session_id)
        assert reloaded_session is not None
        assert reloaded_session.id == session_id
        assert reloaded_session.metadata_json == {"run": "first_process"}
        assert reloaded_session.status == "active"

        reloaded_telemetry = await telemetry_service.get_session_telemetry(session_2, session_id)
        assert len(reloaded_telemetry) == 1
        assert reloaded_telemetry[0].latitude == 28.6139
        assert reloaded_telemetry[0].longitude == 77.2090
        assert reloaded_telemetry[0].speed == 22.5
        assert reloaded_telemetry[0].mode == "DEAD_RECKONING"

    await engine_2.dispose()


@pytest.mark.asyncio
async def test_10_api_routes_end_to_end():
    """10. End-to-end FastAPI HTTP client test validating routes with database persistence."""
    import httpx
    from app.main import create_app
    from app.core.database import get_db

    # Create isolated test engine for FastAPI dependency override
    test_engine = setup_sqlite_engine(create_async_engine("sqlite+aiosqlite:///:memory:", echo=False))
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    test_factory = async_sessionmaker(test_engine, expire_on_commit=False)

    async def override_get_db():
        async with test_factory() as session:
            yield session

    from app.core.security import get_current_device
    from app.models.device import Device

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_device] = lambda: Device(id="test-device-id", device_id_hash="dummy_hash", is_active=True)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Health check
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

        # Start session
        start_res = await client.post("/api/v1/session/start", json={"metadata": {"test": "api"}})
        assert start_res.status_code == 200
        session_data = start_res.json()
        session_id = session_data["id"]
        assert session_data["status"] == "active"

        # Ingest single telemetry
        telemetry_payload = {
            "session_id": session_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "latitude": 13.0827,
            "longitude": 80.2707,
            "speed": 12.0,
            "heading": 45.0,
            "confidence": 0.9,
            "mode": "GNSS_LOCKED",
        }
        ingest_res = await client.post("/api/v1/telemetry", json=telemetry_payload)
        assert ingest_res.status_code == 201
        assert ingest_res.json()["session_id"] == session_id

        # Ingest batch telemetry
        batch_payload = {
            "records": [
                {
                    "session_id": session_id,
                    "timestamp": (datetime.now(timezone.utc) + timedelta(seconds=1)).isoformat(),
                    "latitude": 13.0828,
                    "longitude": 80.2708,
                    "speed": 14.0,
                    "heading": 45.0,
                    "confidence": 0.85,
                    "mode": "DEAD_RECKONING",
                }
            ]
        }
        batch_res = await client.post("/api/v1/telemetry/batch", json=batch_payload)
        assert batch_res.status_code == 201
        assert len(batch_res.json()) == 1

        # Query session telemetry
        get_res = await client.get(f"/api/v1/telemetry/session/{session_id}")
        assert get_res.status_code == 200
        assert len(get_res.json()) == 2

        # Stop session
        stop_res = await client.post(f"/api/v1/session/{session_id}/stop")
        assert stop_res.status_code == 200
        assert stop_res.json()["status"] == "stopped"

        # Session summary
        summary_res = await client.get(f"/api/v1/session/{session_id}/summary")
        assert summary_res.status_code == 200
        summary_data = summary_res.json()
        assert summary_data["telemetry_count"] == 2
        assert summary_data["status"] == "stopped"

        # Rejection for non-existent session
        bad_res = await client.post(
            "/api/v1/telemetry",
            json={
                "session_id": "missing-uuid-1234",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "latitude": 10.0,
                "longitude": 20.0,
            },
        )
        assert bad_res.status_code == 404

    await test_engine.dispose()



