import asyncio
from datetime import datetime, timezone
import json
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import httpx
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import app.core.database
from app.api.websockets.subscriber import run_telemetry_subscriber
from app.api.websockets.ws_manager import ConnectionManager
from app.config import Settings
from app.core.database import get_db
from app.core.redis_client import (
    ping_redis,
    publish_telemetry_event,
    shutdown_redis_client,
    startup_redis_client,
)
from app.main import create_app
from app.models.base import Base
from app.models.drive_session import DriveSession
from app.schemas.telemetry_schema import (
    TelemetryIn,
    TelemetryOut,
    serialize_telemetry_event,
)
from app.services.session_service import create_session
from app.services.telemetry_service import insert_telemetry, insert_telemetry_batch
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


class FakePubSub:
    def __init__(self, channel_queue: asyncio.Queue, stop_event: asyncio.Event | None = None):
        self.queue = channel_queue
        self.subscribed: list[str] = []
        self.closed = False
        self.stop_event = stop_event

    async def subscribe(self, channel: str):
        self.subscribed.append(channel)

    async def unsubscribe(self, channel: str):
        if channel in self.subscribed:
            self.subscribed.remove(channel)

    async def close(self):
        self.closed = True

    async def listen(self):
        while not self.closed:
            if self.stop_event is not None and self.stop_event.is_set():
                break
            try:
                msg = await asyncio.wait_for(self.queue.get(), timeout=0.05)
                yield {"type": "message", "channel": "telemetry:live", "data": msg}
            except asyncio.TimeoutError:
                if self.stop_event is not None and self.stop_event.is_set():
                    break
                continue


class FakeRedis:
    def __init__(self, stop_event: asyncio.Event | None = None):
        self.published: list[tuple[str, str]] = []
        self.channel_queues: dict[str, asyncio.Queue] = {}
        self.fail_publish = False
        self.is_closed = False
        self.stop_event = stop_event

    async def ping(self):
        return True

    async def publish(self, channel: str, message: str):
        if self.fail_publish:
            raise ConnectionError("Simulated Redis network partition")
        self.published.append((channel, message))
        if channel in self.channel_queues:
            await self.channel_queues[channel].put(message)
        return 1

    def pubsub(self):
        q = asyncio.Queue()
        self.channel_queues["telemetry:live"] = q
        return FakePubSub(q, stop_event=self.stop_event)

    async def aclose(self):
        self.is_closed = True


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


# 1. Redis Client Initialization & Ping
@pytest.mark.asyncio
async def test_1_redis_client_init_and_ping():
    settings = Settings(redis_url=None)
    client = await startup_redis_client(settings)
    assert client is None
    assert await ping_redis(None) is False

    fake = FakeRedis()
    assert await ping_redis(fake) is True
    await shutdown_redis_client()


# 2. Telemetry Event Contract Serialization
def test_2_telemetry_event_serialization():
    now = datetime.now(timezone.utc)
    rec = TelemetryOut(
        session_id="sess-phase4",
        timestamp=now,
        latitude=12.9716,
        longitude=77.5946,
        altitude=920.5,
        speed=15.2,
        heading=180.0,
        confidence=0.95,
        gnss_available=True,
        mode="DEAD_RECKONING",
        received_at=now,
    )
    event = serialize_telemetry_event(rec)

    assert event["type"] == "telemetry"
    assert event["session_id"] == "sess-phase4"
    assert event["latitude"] == 12.9716
    assert event["longitude"] == 77.5946
    assert event["altitude"] == 920.5
    assert event["speed"] == 15.2
    assert event["heading"] == 180.0
    assert event["confidence"] == 0.95
    assert event["gnss_available"] is True
    assert event["mode"] == "DEAD_RECKONING"

    dumped = json.dumps(event)
    assert "sess-phase4" in dumped


# 3. PostgreSQL Success with Redis Failure Isolation (Single)
@pytest.mark.asyncio
async def test_3_single_telemetry_persistence_with_redis_failure(async_db: AsyncSession):
    sess = await create_session(async_db, {"test": "redis_failure"})
    fake_redis = FakeRedis()
    fake_redis.fail_publish = True  # Redis fails on publish

    payload = TelemetryIn(
        session_id=sess.id,
        timestamp=datetime.now(timezone.utc),
        latitude=12.9716,
        longitude=77.5946,
        speed=10.0,
        heading=90.0,
        confidence=0.9,
    )

    # 1. DB persistence succeeds
    out = await insert_telemetry(async_db, payload)
    assert out.session_id == sess.id

    # 2. Attempt Redis publish with failing Redis
    event = serialize_telemetry_event(out)
    success = await publish_telemetry_event("telemetry:live", event, client=fake_redis)
    # Auxiliary failure returns False without raising
    assert success is False

    # 3. DB remains persisted and committed
    db_rec = await async_db.get(DriveSession, sess.id)
    assert db_rec is not None


# 4. Post-Commit Publish (Single)
@pytest.mark.asyncio
async def test_4_publish_after_successful_commit(async_db: AsyncSession):
    sess = await create_session(async_db)
    fake_redis = FakeRedis()

    payload = TelemetryIn(
        session_id=sess.id,
        timestamp=datetime.now(timezone.utc),
        latitude=13.0827,
        longitude=80.2707,
    )
    out = await insert_telemetry(async_db, payload)
    event = serialize_telemetry_event(out)

    success = await publish_telemetry_event("telemetry:live", event, client=fake_redis)
    assert success is True
    assert len(fake_redis.published) == 1
    channel, raw_msg = fake_redis.published[0]
    assert channel == "telemetry:live"
    data = json.loads(raw_msg)
    assert data["session_id"] == sess.id
    assert data["latitude"] == 13.0827


# 5. Batch Publish After Successful Commit
@pytest.mark.asyncio
async def test_5_batch_publish_after_successful_commit(async_db: AsyncSession):
    sess = await create_session(async_db)
    fake_redis = FakeRedis()

    records = [
        TelemetryIn(
            session_id=sess.id,
            timestamp=datetime.now(timezone.utc),
            latitude=13.08 + i * 0.001,
            longitude=80.27,
        )
        for i in range(5)
    ]
    outputs = await insert_telemetry_batch(async_db, records)
    assert len(outputs) == 5

    # Publish each committed record post-commit
    for item in outputs:
        event = serialize_telemetry_event(item)
        await publish_telemetry_event("telemetry:live", event, client=fake_redis)

    assert len(fake_redis.published) == 5
    for i, (ch, msg) in enumerate(fake_redis.published):
        assert ch == "telemetry:live"
        data = json.loads(msg)
        assert data["session_id"] == sess.id
        assert abs(data["latitude"] - (13.08 + i * 0.001)) < 1e-6


# 6. Redis Subscriber Receives Event and Forwards to ConnectionManager
@pytest.mark.asyncio
async def test_6_subscriber_receives_event_and_broadcasts():
    stop_event = asyncio.Event()
    fake_redis = FakeRedis(stop_event=stop_event)
    manager = ConnectionManager()
    broadcasted_messages: list[dict] = []

    async def mock_broadcast(msg: dict):
        broadcasted_messages.append(msg)

    manager.broadcast = mock_broadcast

    subscriber_task = asyncio.create_task(
        run_telemetry_subscriber(fake_redis, manager, "telemetry:live", stop_event=stop_event)
    )

    # Let subscriber initialize subscription
    await asyncio.sleep(0.05)

    test_event = {"type": "telemetry", "session_id": "sub-1", "latitude": 10.0}
    await fake_redis.publish("telemetry:live", json.dumps(test_event))

    # Give message loop time to process
    await asyncio.sleep(0.05)

    assert len(broadcasted_messages) == 1
    assert broadcasted_messages[0]["session_id"] == "sub-1"

    # Clean shutdown via stop_event
    stop_event.set()
    await subscriber_task


# 7. Duplicate Broadcast Prevention & Single Broadcast Path
@pytest.mark.asyncio
async def test_7_duplicate_broadcast_prevention_e2e():
    engine = setup_sqlite_engine(create_async_engine("sqlite+aiosqlite:///:memory:", echo=False))
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def override_get_db():
        async with factory() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db

    fake_redis = FakeRedis()
    app.state.redis_client = fake_redis

    manager = ConnectionManager()
    direct_broadcasts: list[dict] = []

    async def mock_broadcast(msg: dict):
        direct_broadcasts.append(msg)

    manager.broadcast = mock_broadcast
    app.state.ws_manager = manager

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        s_res = await client.post("/api/v1/session/start", json={"metadata": {"test": "p4"}})
        session_id = s_res.json()["id"]

        t_res = await client.post(
            "/api/v1/telemetry",
            json={
                "session_id": session_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "latitude": 15.0,
                "longitude": 75.0,
            },
        )
        assert t_res.status_code == 201

    # When Redis is active:
    # 1. Event was published to Redis exactly once
    assert len(fake_redis.published) == 1
    # 2. Direct broadcast from route was NOT called (preventing duplicates!)
    assert len(direct_broadcasts) == 0

    await engine.dispose()


# 8. Local Fallback Broadcast when Redis is Disabled
@pytest.mark.asyncio
async def test_8_local_fallback_broadcast_when_redis_disabled():
    engine = setup_sqlite_engine(create_async_engine("sqlite+aiosqlite:///:memory:", echo=False))
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def override_get_db():
        async with factory() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    app.state.redis_client = None  # Redis disabled

    manager = ConnectionManager()
    fallback_broadcasts: list[dict] = []

    async def mock_broadcast(msg: dict):
        fallback_broadcasts.append(msg)

    manager.broadcast = mock_broadcast
    app.state.ws_manager = manager

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        s_res = await client.post("/api/v1/session/start", json={})
        session_id = s_res.json()["id"]

        t_res = await client.post(
            "/api/v1/telemetry",
            json={
                "session_id": session_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "latitude": 15.0,
                "longitude": 75.0,
            },
        )
        assert t_res.status_code == 201

    # When Redis is disabled, fallback direct broadcast is called exactly once
    assert len(fallback_broadcasts) == 1
    assert fallback_broadcasts[0]["session_id"] == session_id

    await engine.dispose()


# 9. Subscriber Graceful Shutdown with Cancellation
@pytest.mark.asyncio
async def test_9_subscriber_graceful_shutdown():
    fake_redis = FakeRedis()
    manager = ConnectionManager()

    subscriber_task = asyncio.create_task(
        run_telemetry_subscriber(fake_redis, manager, "telemetry:live")
    )
    await asyncio.sleep(0.05)
    assert not subscriber_task.done()

    # Cancel task
    subscriber_task.cancel()
    try:
        await subscriber_task
    except asyncio.CancelledError:
        pass
    assert subscriber_task.done()


# 10. Health and Ready Endpoints
@pytest.mark.asyncio
async def test_10_health_and_ready_endpoints():
    engine = setup_sqlite_engine(create_async_engine("sqlite+aiosqlite:///:memory:", echo=False))
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def override_get_db():
        async with factory() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # /health is always 200 and lightweight
        h_res = await client.get("/health")
        assert h_res.status_code == 200
        assert h_res.json()["status"] == "ok"

        # /ready checks dependencies
        r_res = await client.get("/ready")
        assert r_res.status_code == 200
        r_data = r_res.json()
        assert r_data["status"] == "ready"
        assert r_data["dependencies"]["database"] == "ok"

    await engine.dispose()
