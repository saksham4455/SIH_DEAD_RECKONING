import logging
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.database import get_db
from app.schemas.model_schema import ModelDeleteResponse, ModelRollbackResponse, ModelVersionOut
from app.services import model_registry_service
from app.storage.object_storage_client import get_storage_client

logger = logging.getLogger("backend.api.models")

router = APIRouter(prefix="/models", tags=["models"])


def legacy_model_directory() -> Path:
    settings = get_settings()
    return Path(__file__).resolve().parents[3] / settings.model_directory


@router.post("", response_model=ModelVersionOut, status_code=status.HTTP_201_CREATED)
async def upload_model(
    file: UploadFile = File(...),
    model_type: str = Form("speed"),
    version: str = Form("1.0.0"),
    description: str | None = Form(None),
    set_active: bool = Form(True),
    db: AsyncSession = Depends(get_db),
) -> ModelVersionOut:
    """Upload and register a new TFLite model artifact in object storage and PostgreSQL metadata."""
    settings = get_settings()
    if not file.filename or not file.filename.lower().endswith(".tflite"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid file '{file.filename}'. Only .tflite model artifacts are supported.",
        )

    content = await file.read()
    if len(content) > settings.max_model_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size ({len(content)} bytes) exceeds the maximum upload limit of {settings.max_model_upload_size_bytes} bytes.",
        )

    storage = get_storage_client(settings)
    record = await model_registry_service.register_model(
        db=db,
        storage=storage,
        file_content=content,
        filename=file.filename,
        model_type=model_type,
        version=version,
        description=description,
        set_active=set_active,
    )
    return ModelVersionOut.model_validate(record)


@router.get("/latest", response_model=ModelVersionOut)
async def latest_model(
    model_type: str = Query("speed", description="Model type identifier"),
    db: AsyncSession = Depends(get_db),
) -> ModelVersionOut:
    """Query the currently active model version metadata for the given model_type."""
    model = await model_registry_service.get_latest_active_model(db, model_type)
    if model is not None:
        return ModelVersionOut.model_validate(model)

    # Legacy filesystem fallback for backward compatibility
    dir_path = legacy_model_directory()
    if dir_path.exists():
        files = sorted(p for p in dir_path.iterdir() if p.is_file() and p.suffix in {".tflite", ".onnx"})
        if files:
            latest = files[-1]
            return ModelVersionOut(
                id="legacy-local",
                model_type=model_type,
                version="legacy",
                storage_key=latest.name,
                uploaded_at=latest.stat().st_mtime,
                is_active=True,
                file_size_bytes=latest.stat().st_size,
                filename=latest.name,
                size_bytes=latest.stat().st_size,
            )

    raise HTTPException(status_code=404, detail=f"No active model artifact is available for model type '{model_type}'")


@router.get("/download/{identifier}")
async def download_model(
    identifier: str,
    db: AsyncSession = Depends(get_db),
):
    """Download a model binary by its version ID or filename."""
    settings = get_settings()
    storage = get_storage_client(settings)

    model = await model_registry_service.get_model_by_filename_or_id(db, identifier)
    if model is not None:
        if await storage.exists(model.storage_key):
            stream = storage.stream(model.storage_key)
            dl_filename = model.storage_key.split("/")[-1] if model.storage_key else "model.tflite"
            return StreamingResponse(
                stream,
                media_type="application/octet-stream",
                headers={"Content-Disposition": f'attachment; filename="{dl_filename}"'},
            )

    # Legacy filesystem fallback
    dir_path = legacy_model_directory().resolve()
    target = (dir_path / identifier).resolve()
    if dir_path in target.parents and target.is_file():
        return FileResponse(target, filename=target.name, media_type="application/octet-stream")

    raise HTTPException(status_code=404, detail=f"Model artifact '{identifier}' was not found")


@router.get("", response_model=list[ModelVersionOut])
async def list_models(
    model_type: str | None = Query(None, description="Optional model type filter"),
    db: AsyncSession = Depends(get_db),
) -> list[ModelVersionOut]:
    """List all registered model versions."""
    models = await model_registry_service.list_models(db, model_type)
    return [ModelVersionOut.model_validate(m) for m in models]


@router.post("/{version_id}/rollback", response_model=ModelRollbackResponse)
async def rollback_model(
    version_id: str,
    db: AsyncSession = Depends(get_db),
) -> ModelRollbackResponse:
    """Roll back / activate a previous model version atomically."""
    settings = get_settings()
    storage = get_storage_client(settings)
    active = await model_registry_service.rollback_model(db, storage, version_id)
    return ModelRollbackResponse(
        message=f"Successfully activated model version {active.version} for model type {active.model_type}",
        active_version=ModelVersionOut.model_validate(active),
    )


@router.delete("/{version_id}", response_model=ModelDeleteResponse)
async def delete_model(
    version_id: str,
    db: AsyncSession = Depends(get_db),
) -> ModelDeleteResponse:
    """Delete an inactive model version and its object storage binary."""
    settings = get_settings()
    storage = get_storage_client(settings)
    await model_registry_service.delete_model(db, storage, version_id)
    return ModelDeleteResponse(
        message="Model version deleted successfully",
        deleted_version_id=version_id,
    )
