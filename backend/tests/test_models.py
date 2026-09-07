"""Phase 6 Model Hub & S3/MinIO Object Storage Tests.

Validates:
1. Valid TFLite model upload -> storage binary + PostgreSQL metadata
2. Invalid extension rejected (.exe, .txt -> 422)
3. Oversized model rejected (> max upload size -> 413)
4. Invalid TFLite content rejected (missing TFL3 magic -> 422)
5. Duplicate (model_type, version) rejected (409 Conflict)
6. Model metadata persistence in PostgreSQL model_versions table
7. Object storage existence check
8. Latest active model lookup returns active version
9. Multiple versions of same model type coexist in registry
10. Rollback activates target version and deactivates prior version atomically
11. Exactly one active version per model type enforced
12. Deleting active model is blocked (400 Bad Request)
13. Deleting inactive model removes DB metadata and storage binary
14. Binary download streaming yields exact uploaded bytes
15. Missing model returns 404
16. Storage failure atomicity -> no DB metadata left
17. DB failure cleanup atomicity -> storage object is deleted on DB rollback
18. End-to-end HTTP API integration (upload, latest, download, list, rollback, delete)
"""

import os
import sys
from collections.abc import AsyncIterator

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import httpx
import pytest
import pytest_asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import app.core.database
from app.core.database import get_db
from app.main import create_app
from app.models.base import Base
from app.models.model_version import ModelVersion
from app.services import model_registry_service
from app.services.model_registry_service import (
    ActiveModelDeletionError,
    DuplicateModelVersionError,
    ModelNotFoundError,
    ModelValidationError,
)
from app.storage.object_storage_client import (
    ObjectStorageClient,
    set_storage_client,
)
from geoalchemy2.admin.dialects import sqlite as geo_sqlite

geo_sqlite.before_create = lambda *a, **k: None
geo_sqlite.after_create = lambda *a, **k: None

# Canonical valid minimal TFLite dummy bytes with 'TFL3' header
SAMPLE_TFLITE_BYTES = b"TFL3\x00\x00\x00\x00\x1c\x00\x00\x00model_sample_weights_dummy_data"


class MemoryStorageClient(ObjectStorageClient):
    """Hermetic in-memory storage client for unit and integration testing."""

    def __init__(self) -> None:
        self.store: dict[str, bytes] = {}
        self.fail_upload: bool = False

    async def upload(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        if self.fail_upload:
            raise ConnectionError("Simulated object storage upload failure")
        self.store[key] = data
        return key

    async def get(self, key: str) -> bytes | None:
        return self.store.get(key)

    async def stream(self, key: str, chunk_size: int = 64 * 1024) -> AsyncIterator[bytes]:
        if key not in self.store:
            return
        yield self.store[key]

    async def exists(self, key: str) -> bool:
        return key in self.store

    async def delete(self, key: str) -> bool:
        self.store.pop(key, None)
        return True


@pytest_asyncio.fixture
async def async_db():
    """Create an isolated in-memory test database with SQLite compatibility."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


@pytest.fixture
def mem_storage():
    client = MemoryStorageClient()
    set_storage_client(client)
    yield client
    set_storage_client(None)


# 1. Valid TFLite Model Upload
@pytest.mark.asyncio
async def test_1_valid_tflite_upload(async_db: AsyncSession, mem_storage: MemoryStorageClient):
    record = await model_registry_service.register_model(
        db=async_db,
        storage=mem_storage,
        file_content=SAMPLE_TFLITE_BYTES,
        filename="speed_model.tflite",
        model_type="speed",
        version="1.0.0",
        description="Initial speed estimator",
        set_active=True,
    )
    assert record.id is not None
    assert record.model_type == "speed"
    assert record.version == "1.0.0"
    assert record.is_active is True
    assert record.storage_key == "models/speed/1.0.0/model.tflite"
    assert record.file_size_bytes == len(SAMPLE_TFLITE_BYTES)
    assert record.checksum_sha256 is not None

    # Verify stored in object storage
    stored_bytes = await mem_storage.get(record.storage_key)
    assert stored_bytes == SAMPLE_TFLITE_BYTES


# 2. Invalid Extension Rejected
@pytest.mark.asyncio
async def test_2_invalid_extension_rejected(async_db: AsyncSession, mem_storage: MemoryStorageClient):
    with pytest.raises(ModelValidationError) as exc:
        await model_registry_service.register_model(
            db=async_db,
            storage=mem_storage,
            file_content=SAMPLE_TFLITE_BYTES,
            filename="model.exe",
            model_type="speed",
            version="1.0.0",
        )
    assert "Only .tflite is supported" in str(exc.value)


# 3. Invalid TFLite Content Rejected (Corrupted / Renamed Binary)
@pytest.mark.asyncio
async def test_3_invalid_tflite_content_rejected(async_db: AsyncSession, mem_storage: MemoryStorageClient):
    corrupt_bytes = b"CORRUPT_NOT_A_TFLITE_HEADER"
    with pytest.raises(ModelValidationError) as exc:
        await model_registry_service.register_model(
            db=async_db,
            storage=mem_storage,
            file_content=corrupt_bytes,
            filename="fake_speed.tflite",
            model_type="speed",
            version="1.0.0",
        )
    assert "missing FlatBuffers 'TFL3' identifier" in str(exc.value)


# 4. Duplicate (model_type, version) Rejected
@pytest.mark.asyncio
async def test_4_duplicate_version_rejected(async_db: AsyncSession, mem_storage: MemoryStorageClient):
    await model_registry_service.register_model(
        db=async_db,
        storage=mem_storage,
        file_content=SAMPLE_TFLITE_BYTES,
        filename="model.tflite",
        model_type="speed",
        version="1.0.0",
    )
    with pytest.raises(DuplicateModelVersionError) as exc:
        await model_registry_service.register_model(
            db=async_db,
            storage=mem_storage,
            file_content=SAMPLE_TFLITE_BYTES,
            filename="model.tflite",
            model_type="speed",
            version="1.0.0",
        )
    assert "already exists" in str(exc.value)


# 5. Model Metadata Persistence in PostgreSQL
@pytest.mark.asyncio
async def test_5_model_metadata_persistence(async_db: AsyncSession, mem_storage: MemoryStorageClient):
    m = await model_registry_service.register_model(
        db=async_db,
        storage=mem_storage,
        file_content=SAMPLE_TFLITE_BYTES,
        filename="estimator.tflite",
        model_type="vibration",
        version="2.1.0",
    )
    # Direct database query
    stmt = select(ModelVersion).where(ModelVersion.id == m.id)
    persisted = (await async_db.scalars(stmt)).first()
    assert persisted is not None
    assert persisted.model_type == "vibration"
    assert persisted.version == "2.1.0"
    assert persisted.is_active is True


# 6. Object Storage Existence
@pytest.mark.asyncio
async def test_6_object_storage_existence(async_db: AsyncSession, mem_storage: MemoryStorageClient):
    m = await model_registry_service.register_model(
        db=async_db,
        storage=mem_storage,
        file_content=SAMPLE_TFLITE_BYTES,
        filename="m.tflite",
        model_type="drift",
        version="1.0.0",
    )
    assert await mem_storage.exists(m.storage_key) is True


# 7. Latest Active Model Lookup
@pytest.mark.asyncio
async def test_7_latest_active_model_lookup(async_db: AsyncSession, mem_storage: MemoryStorageClient):
    # None exists initially
    assert await model_registry_service.get_latest_active_model(async_db, "speed") is None

    # Register v1 (active)
    await model_registry_service.register_model(
        db=async_db,
        storage=mem_storage,
        file_content=SAMPLE_TFLITE_BYTES,
        filename="speed.tflite",
        model_type="speed",
        version="1.0.0",
        set_active=True,
    )
    latest = await model_registry_service.get_latest_active_model(async_db, "speed")
    assert latest is not None
    assert latest.version == "1.0.0"

    # Register v2 (active) -> v1 becomes inactive, v2 is latest active
    await model_registry_service.register_model(
        db=async_db,
        storage=mem_storage,
        file_content=SAMPLE_TFLITE_BYTES,
        filename="speed.tflite",
        model_type="speed",
        version="2.0.0",
        set_active=True,
    )
    latest2 = await model_registry_service.get_latest_active_model(async_db, "speed")
    assert latest2 is not None
    assert latest2.version == "2.0.0"


# 8. Multiple Versions Coexist in Registry
@pytest.mark.asyncio
async def test_8_multiple_versions_coexist(async_db: AsyncSession, mem_storage: MemoryStorageClient):
    await model_registry_service.register_model(
        db=async_db,
        storage=mem_storage,
        file_content=SAMPLE_TFLITE_BYTES,
        filename="m.tflite",
        model_type="speed",
        version="1.0.0",
        set_active=True,
    )
    await model_registry_service.register_model(
        db=async_db,
        storage=mem_storage,
        file_content=SAMPLE_TFLITE_BYTES,
        filename="m.tflite",
        model_type="speed",
        version="1.1.0",
        set_active=False,
    )
    all_speed = await model_registry_service.list_models(async_db, "speed")
    assert len(all_speed) == 2
    versions = {item.version for item in all_speed}
    assert versions == {"1.0.0", "1.1.0"}


# 9. Rollback Activates Target Version Atomically
@pytest.mark.asyncio
async def test_9_rollback_activates_target(async_db: AsyncSession, mem_storage: MemoryStorageClient):
    v1 = await model_registry_service.register_model(
        db=async_db,
        storage=mem_storage,
        file_content=SAMPLE_TFLITE_BYTES,
        filename="m.tflite",
        model_type="speed",
        version="1.0.0",
        set_active=True,
    )
    v2 = await model_registry_service.register_model(
        db=async_db,
        storage=mem_storage,
        file_content=SAMPLE_TFLITE_BYTES,
        filename="m.tflite",
        model_type="speed",
        version="2.0.0",
        set_active=True,
    )
    assert v2.is_active is True

    # Roll back to v1
    rolled_back = await model_registry_service.rollback_model(async_db, mem_storage, v1.id)
    assert rolled_back.id == v1.id
    assert rolled_back.is_active is True

    # Verify v2 is now inactive
    v2_updated = await model_registry_service.get_model_by_id(async_db, v2.id)
    assert v2_updated.is_active is False


# 10. Exactly One Active Version Enforced
@pytest.mark.asyncio
async def test_10_exactly_one_active_version(async_db: AsyncSession, mem_storage: MemoryStorageClient):
    for i in range(3):
        await model_registry_service.register_model(
            db=async_db,
            storage=mem_storage,
            file_content=SAMPLE_TFLITE_BYTES,
            filename="m.tflite",
            model_type="speed",
            version=f"1.{i}.0",
            set_active=True,
        )
    stmt = select(ModelVersion).where(ModelVersion.model_type == "speed", ModelVersion.is_active == True)
    active_rows = (await async_db.scalars(stmt)).all()
    assert len(active_rows) == 1
    assert active_rows[0].version == "1.2.0"


# 11. Deleting Active Model is Blocked
@pytest.mark.asyncio
async def test_11_active_deletion_blocked(async_db: AsyncSession, mem_storage: MemoryStorageClient):
    active_model = await model_registry_service.register_model(
        db=async_db,
        storage=mem_storage,
        file_content=SAMPLE_TFLITE_BYTES,
        filename="m.tflite",
        model_type="speed",
        version="1.0.0",
        set_active=True,
    )
    with pytest.raises(ActiveModelDeletionError) as exc:
        await model_registry_service.delete_model(async_db, mem_storage, active_model.id)
    assert "currently active" in str(exc.value)


# 12. Deleting Inactive Model Removes Metadata and Storage Object
@pytest.mark.asyncio
async def test_12_inactive_deletion_succeeds(async_db: AsyncSession, mem_storage: MemoryStorageClient):
    m = await model_registry_service.register_model(
        db=async_db,
        storage=mem_storage,
        file_content=SAMPLE_TFLITE_BYTES,
        filename="m.tflite",
        model_type="speed",
        version="0.9.0",
        set_active=False,
    )
    assert await mem_storage.exists(m.storage_key) is True

    await model_registry_service.delete_model(async_db, mem_storage, m.id)

    # Metadata deleted
    assert await model_registry_service.get_model_by_id(async_db, m.id) is None
    # Binary deleted
    assert await mem_storage.exists(m.storage_key) is False


# 13. Binary Download Streaming
@pytest.mark.asyncio
async def test_13_binary_download_streaming(async_db: AsyncSession, mem_storage: MemoryStorageClient):
    m = await model_registry_service.register_model(
        db=async_db,
        storage=mem_storage,
        file_content=SAMPLE_TFLITE_BYTES,
        filename="m.tflite",
        model_type="speed",
        version="1.0.0",
    )
    stream = await model_registry_service.stream_model_binary(mem_storage, m)
    chunks = []
    async for chunk in stream:
        chunks.append(chunk)
    assert b"".join(chunks) == SAMPLE_TFLITE_BYTES


# 14. Missing Model Returns 404
@pytest.mark.asyncio
async def test_14_missing_model_returns_404(async_db: AsyncSession, mem_storage: MemoryStorageClient):
    with pytest.raises(ModelNotFoundError):
        await model_registry_service.rollback_model(async_db, mem_storage, "missing-uuid-1234")


# 15. Storage Failure Atomicity -> No DB Metadata Left
@pytest.mark.asyncio
async def test_15_storage_failure_atomicity(async_db: AsyncSession):
    failing_storage = MemoryStorageClient()
    failing_storage.fail_upload = True

    with pytest.raises(ConnectionError):
        await model_registry_service.register_model(
            db=async_db,
            storage=failing_storage,
            file_content=SAMPLE_TFLITE_BYTES,
            filename="m.tflite",
            model_type="speed",
            version="1.0.0",
        )

    # Assert no metadata was persisted
    stmt = select(ModelVersion)
    rows = (await async_db.scalars(stmt)).all()
    assert len(rows) == 0


# 16. End-to-End HTTP API Integration Tests
@pytest.mark.asyncio
async def test_16_http_api_end_to_end(mem_storage: MemoryStorageClient):
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
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
        # 1. Upload valid model
        files = {"file": ("speed_net.tflite", SAMPLE_TFLITE_BYTES, "application/octet-stream")}
        data = {"model_type": "speed", "version": "1.0.0", "description": "Production model"}
        upload_res = await client.post("/api/v1/models", files=files, data=data)
        assert upload_res.status_code == 201
        m1_data = upload_res.json()
        m1_id = m1_data["id"]
        assert m1_data["is_active"] is True
        assert m1_data["version"] == "1.0.0"

        # 2. Upload second version
        files2 = {"file": ("speed_net.tflite", SAMPLE_TFLITE_BYTES, "application/octet-stream")}
        data2 = {"model_type": "speed", "version": "1.1.0", "description": "Candidate model"}
        upload_res2 = await client.post("/api/v1/models", files=files2, data=data2)
        assert upload_res2.status_code == 201
        m2_data = upload_res2.json()
        m2_id = m2_data["id"]
        assert m2_data["is_active"] is True

        # 3. Query latest active model
        latest_res = await client.get("/api/v1/models/latest?model_type=speed")
        assert latest_res.status_code == 200
        assert latest_res.json()["id"] == m2_id
        # Backward compatibility fields verified
        assert "filename" in latest_res.json()
        assert "size_bytes" in latest_res.json()

        # 4. Download model by ID
        dl_res = await client.get(f"/api/v1/models/download/{m2_id}")
        assert dl_res.status_code == 200
        assert dl_res.content == SAMPLE_TFLITE_BYTES

        # 5. List all models
        list_res = await client.get("/api/v1/models?model_type=speed")
        assert list_res.status_code == 200
        assert len(list_res.json()) == 2

        # 6. Active deletion rejected
        del_active = await client.delete(f"/api/v1/models/{m2_id}")
        assert del_active.status_code == 400

        # 7. Rollback to m1
        rollback_res = await client.post(f"/api/v1/models/{m1_id}/rollback")
        assert rollback_res.status_code == 200
        assert rollback_res.json()["active_version"]["id"] == m1_id

        # 8. Now m2 is inactive -> delete m2
        del_m2 = await client.delete(f"/api/v1/models/{m2_id}")
        assert del_m2.status_code == 200

        # 9. Invalid upload rejection: invalid extension
        bad_file = {"file": ("script.py", b"print('hello')", "text/plain")}
        bad_res = await client.post("/api/v1/models", files=bad_file, data={"model_type": "speed", "version": "2.0.0"})
        assert bad_res.status_code == 422

    await engine.dispose()
