from collections.abc import AsyncIterator
from datetime import datetime, timezone
import hashlib
import logging
import re
from uuid import uuid4

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.model_version import ModelVersion
from app.storage.object_storage_client import ObjectStorageClient

logger = logging.getLogger("backend.services.model_registry")


class ModelValidationError(AppException):
    def __init__(self, message: str) -> None:
        super().__init__(message=message, status_code=422)


class ModelNotFoundError(AppException):
    def __init__(self, identifier: str) -> None:
        super().__init__(message=f"Model artifact '{identifier}' was not found", status_code=404)


class DuplicateModelVersionError(AppException):
    def __init__(self, model_type: str, version: str) -> None:
        super().__init__(
            message=f"Model version '{version}' for model type '{model_type}' already exists",
            status_code=409,
        )


class ActiveModelDeletionError(AppException):
    def __init__(self, version_id: str) -> None:
        super().__init__(
            message=f"Cannot delete model version '{version_id}' because it is currently active. Roll back or activate another version first.",
            status_code=400,
        )


def validate_tflite_model(content: bytes, filename: str) -> None:
    """Validate that the given binary payload is a structurally valid TFLite model.

    FlatBuffers format checks:
    - Minimum length > 8 bytes.
    - FlatBuffers file identifier 'TFL3' at offset 0 or offset 4.
    """
    if not filename.lower().endswith(".tflite"):
        raise ModelValidationError(f"Invalid model extension for '{filename}'. Only .tflite is supported.")

    if len(content) < 8:
        raise ModelValidationError("Uploaded file is too small to be a valid TFLite model.")

    has_magic = content.startswith(b"TFL3") or (len(content) >= 8 and content[4:8] == b"TFL3")
    if not has_magic:
        raise ModelValidationError("Invalid TFLite binary content: missing FlatBuffers 'TFL3' identifier.")


def sanitize_identifier(value: str) -> str:
    """Sanitize identifier string to prevent path traversal and unsafe characters."""
    sanitized = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", value.strip())
    if not sanitized or ".." in sanitized:
        raise ModelValidationError(f"Invalid identifier name: '{value}'")
    return sanitized


def build_storage_key(model_type: str, version: str) -> str:
    """Build canonical deterministic object storage key for a model version."""
    clean_type = sanitize_identifier(model_type)
    clean_version = sanitize_identifier(version)
    return f"models/{clean_type}/{clean_version}/model.tflite"


def compute_sha256(content: bytes) -> str:
    """Compute SHA-256 hex digest of file binary bytes."""
    return hashlib.sha256(content).hexdigest()


async def register_model(
    db: AsyncSession,
    storage: ObjectStorageClient,
    file_content: bytes,
    filename: str,
    model_type: str = "speed",
    version: str = "1.0.0",
    description: str | None = None,
    set_active: bool = True,
) -> ModelVersion:
    """Validate, store binary in object storage, and persist model metadata in PostgreSQL."""
    validate_tflite_model(file_content, filename)

    clean_type = sanitize_identifier(model_type)
    clean_version = sanitize_identifier(version)

    # 1. Check duplicate model_type + version
    stmt = select(ModelVersion).where(
        ModelVersion.model_type == clean_type,
        ModelVersion.version == clean_version,
    )
    existing = (await db.scalars(stmt)).first()
    if existing is not None:
        raise DuplicateModelVersionError(clean_type, clean_version)

    storage_key = build_storage_key(clean_type, clean_version)
    checksum = compute_sha256(file_content)
    file_size = len(file_content)

    # 2. Upload binary to object storage
    await storage.upload(storage_key, file_content, content_type="application/octet-stream")

    # 3. Create database entity
    record_id = str(uuid4())
    now_utc = datetime.now(timezone.utc)

    try:
        if set_active:
            # Atomically deactivate any currently active version for this model_type
            await db.execute(
                update(ModelVersion)
                .where(ModelVersion.model_type == clean_type, ModelVersion.is_active == True)
                .values(is_active=False)
            )

        model_version = ModelVersion(
            id=record_id,
            model_type=clean_type,
            version=clean_version,
            storage_key=storage_key,
            uploaded_at=now_utc,
            is_active=set_active,
            file_size_bytes=file_size,
            checksum_sha256=checksum,
            description=description,
        )
        db.add(model_version)
        await db.commit()
        await db.refresh(model_version)
        logger.info("Successfully registered model %s v%s (id=%s)", clean_type, clean_version, record_id)
        return model_version
    except Exception as db_err:
        await db.rollback()
        logger.warning("Database insert failed for model %s; attempting storage cleanup: %s", storage_key, db_err)
        try:
            await storage.delete(storage_key)
        except Exception as cleanup_err:
            logger.warning("Object storage cleanup failed for %s: %s", storage_key, cleanup_err)
        raise


async def get_latest_active_model(db: AsyncSession, model_type: str = "speed") -> ModelVersion | None:
    """Retrieve the currently active model version for the given model_type."""
    clean_type = sanitize_identifier(model_type)
    stmt = (
        select(ModelVersion)
        .where(ModelVersion.model_type == clean_type, ModelVersion.is_active == True)
        .order_by(ModelVersion.uploaded_at.desc())
    )
    return (await db.scalars(stmt)).first()


async def get_model_by_id(db: AsyncSession, version_id: str) -> ModelVersion | None:
    """Retrieve a model version by its unique UUID."""
    stmt = select(ModelVersion).where(ModelVersion.id == version_id)
    return (await db.scalars(stmt)).first()


async def get_model_by_filename_or_id(db: AsyncSession, identifier: str) -> ModelVersion | None:
    """Retrieve a model version by UUID or storage key / filename matching."""
    # First attempt exact ID match
    model = await get_model_by_id(db, identifier)
    if model is not None:
        return model

    # Attempt storage_key suffix matching (e.g. filename)
    clean_name = identifier.lstrip("/")
    stmt = select(ModelVersion).where(ModelVersion.storage_key.endswith(clean_name))
    model = (await db.scalars(stmt)).first()
    if model is not None:
        return model

    # Fallback to latest active model if filename is generic
    if identifier in {"model.tflite", "latest.tflite"}:
        return await get_latest_active_model(db, "speed")

    return None


async def list_models(db: AsyncSession, model_type: str | None = None) -> list[ModelVersion]:
    """List all registered model versions, optionally filtered by model_type."""
    stmt = select(ModelVersion).order_by(ModelVersion.uploaded_at.desc())
    if model_type is not None:
        clean_type = sanitize_identifier(model_type)
        stmt = stmt.where(ModelVersion.model_type == clean_type)
    return list((await db.scalars(stmt)).all())


async def stream_model_binary(storage: ObjectStorageClient, model: ModelVersion) -> AsyncIterator[bytes]:
    """Stream model binary chunks from object storage."""
    if not await storage.exists(model.storage_key):
        raise ModelNotFoundError(model.storage_key)
    return storage.stream(model.storage_key)


async def rollback_model(db: AsyncSession, storage: ObjectStorageClient, version_id: str) -> ModelVersion:
    """Atomically activate a previous model version, ensuring only one active version per model_type."""
    target = await get_model_by_id(db, version_id)
    if target is None:
        raise ModelNotFoundError(version_id)

    if not await storage.exists(target.storage_key):
        raise ModelNotFoundError(f"Binary for version '{version_id}' missing in storage")

    if target.is_active:
        return target  # Already active

    # Atomically deactivate current active model of same type and activate target
    await db.execute(
        update(ModelVersion)
        .where(ModelVersion.model_type == target.model_type, ModelVersion.is_active == True)
        .values(is_active=False)
    )
    target.is_active = True
    await db.commit()
    await db.refresh(target)
    logger.info("Rolled back/activated model %s v%s (id=%s)", target.model_type, target.version, target.id)
    return target


async def delete_model(db: AsyncSession, storage: ObjectStorageClient, version_id: str) -> None:
    """Delete an inactive model version metadata and its storage binary."""
    target = await get_model_by_id(db, version_id)
    if target is None:
        raise ModelNotFoundError(version_id)

    if target.is_active:
        raise ActiveModelDeletionError(version_id)

    storage_key = target.storage_key
    await db.delete(target)
    await db.commit()

    try:
        await storage.delete(storage_key)
    except Exception as exc:
        logger.warning("Failed to delete storage binary %s for deleted model %s: %s", storage_key, version_id, exc)
