import os
import sys
from datetime import datetime, timezone

import httpx
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import app.core.database
from app.config import Settings, get_settings
from app.core.database import get_db
from app.core.security import derive_device_id_hash, hash_password
from app.main import create_app
from app.models.base import Base
from app.models.model_version import ModelVersion
from app.models.user import User
from geoalchemy2.admin.dialects import sqlite as geo_sqlite

geo_sqlite.before_create = lambda *a, **k: None
geo_sqlite.after_create = lambda *a, **k: None


def setup_sqlite_engine(engine):
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
async def device_env():
    engine = setup_sqlite_engine(create_async_engine("sqlite+aiosqlite:///:memory:", echo=False))
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    test_settings = Settings(jwt_secret="device-test-secret-key-9999999999999999999932bytes")

    # Seed users and a model version for pinning tests
    async with factory() as db:
        admin = User(username="deviceadmin", password_hash=hash_password("Pass123!"), role="admin")
        norm = User(username="normuser", password_hash=hash_password("Pass123!"), role="user")
        model_v1 = ModelVersion(
            id="model-uuid-v1",
            model_type="speed",
            version="1.0.0",
            storage_key="models/speed/1.0.0/model.tflite",
            file_size_bytes=1000,
            is_active=True,
        )
        db.add_all([admin, norm, model_v1])
        await db.commit()

    async def override_get_db():
        async with factory() as session:
            yield session

    async def override_get_settings():
        return test_settings

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_settings] = override_get_settings

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client, factory, test_settings

    await engine.dispose()


@pytest.mark.asyncio
async def test_device_registration_and_hashing(device_env):
    client, _, settings = device_env

    raw_device_id = "realme-cph2745-hardware-id-001"
    expected_hash = derive_device_id_hash(raw_device_id, settings.jwt_secret)

    # 1. First registration
    res1 = await client.post("/api/v1/devices/register", json={"device_id": raw_device_id})
    assert res1.status_code == 200
    data1 = res1.json()
    assert "access_token" in data1
    assert data1["is_active"] is True
    # Ensure raw device_id and device_id_hash are NOT returned in API output
    assert "device_id" not in data1
    assert "device_id_hash" not in data1

    device_id = data1["id"]

    # 2. Second registration -> Same record, updated timestamp, no duplicate
    res2 = await client.post("/api/v1/devices/register", json={"device_id": raw_device_id})
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["id"] == device_id


@pytest.mark.asyncio
async def test_device_telemetry_ingestion_auth(device_env):
    client, _, _ = device_env

    # Register device and get token
    reg_res = await client.post("/api/v1/devices/register", json={"device_id": "phone-001"})
    device_token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {device_token}"}

    # Start a drive session with device token
    session_res = await client.post("/api/v1/session/start", json={"metadata": {"test": "device_ingestion"}}, headers=headers)
    assert session_res.status_code == 200
    session_id = session_res.json()["id"]

    now_str = datetime.now(timezone.utc).isoformat()

    # 1. Ingest telemetry without token -> 401
    unauth_telemetry = await client.post("/api/v1/telemetry", json={"session_id": session_id, "timestamp": now_str, "latitude": 28.6, "longitude": 77.2, "speed": 12.0})
    assert unauth_telemetry.status_code == 401

    # 2. Ingest telemetry with device token -> 201 Created
    auth_telemetry = await client.post("/api/v1/telemetry", json={"session_id": session_id, "timestamp": now_str, "latitude": 28.6, "longitude": 77.2, "speed": 12.0}, headers=headers)
    assert auth_telemetry.status_code == 201


@pytest.mark.asyncio
async def test_admin_device_management(device_env):
    client, _, _ = device_env

    # Register a device
    reg_res = await client.post("/api/v1/devices/register", json={"device_id": "phone-002"})
    dev_id = reg_res.json()["id"]

    # Login as admin
    admin_login = await client.post("/api/v1/auth/login", json={"username": "deviceadmin", "password": "Pass123!"})
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Login as normal user
    norm_login = await client.post("/api/v1/auth/login", json={"username": "normuser", "password": "Pass123!"})
    norm_token = norm_login.json()["access_token"]
    norm_headers = {"Authorization": f"Bearer {norm_token}"}

    # 1. Normal user list devices -> 403 Forbidden
    norm_list = await client.get("/api/v1/devices", headers=norm_headers)
    assert norm_list.status_code == 403

    # 2. Admin list devices -> 200 OK
    admin_list = await client.get("/api/v1/devices", headers=admin_headers)
    assert admin_list.status_code == 200
    assert len(admin_list.json()) >= 1

    # 3. Admin patch device pin model version
    patch_res = await client.patch(f"/api/v1/devices/{dev_id}", json={"pinned_model_version_id": "model-uuid-v1"}, headers=admin_headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["pinned_model_version_id"] == "model-uuid-v1"

    # 4. Invalid model version pin -> 400 Bad Request
    bad_patch = await client.patch(f"/api/v1/devices/{dev_id}", json={"pinned_model_version_id": "nonexistent-model-id"}, headers=admin_headers)
    assert bad_patch.status_code == 400

    # 5. Deactivate device -> Inactive device token rejected
    await client.patch(f"/api/v1/devices/{dev_id}", json={"is_active": False}, headers=admin_headers)
    device_token = reg_res.json()["access_token"]
    dev_headers = {"Authorization": f"Bearer {device_token}"}

    now_str = datetime.now(timezone.utc).isoformat()
    blocked_tel = await client.post("/api/v1/telemetry", json={"session_id": "s1", "timestamp": now_str, "latitude": 28.6, "longitude": 77.2, "speed": 12.0}, headers=dev_headers)
    assert blocked_tel.status_code == 401
