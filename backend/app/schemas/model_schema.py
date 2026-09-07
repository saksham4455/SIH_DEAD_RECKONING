from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ModelVersionOut(BaseModel):
    """Public model version metadata response schema."""

    id: str
    model_type: str
    version: str
    storage_key: str
    uploaded_at: datetime
    is_active: bool
    file_size_bytes: int
    checksum_sha256: str | None = None
    description: str | None = None

    # Backward compatibility fields for legacy clients expecting filename and size_bytes
    filename: str = ""
    size_bytes: int = 0

    model_config = ConfigDict(from_attributes=True)

    def model_post_init(self, __context) -> None:
        if not self.filename:
            self.filename = self.storage_key.split("/")[-1] if self.storage_key else "model.tflite"
        if not self.size_bytes:
            self.size_bytes = self.file_size_bytes


class ModelRollbackResponse(BaseModel):
    """Response returned when a model version is activated/rolled back."""

    message: str
    active_version: ModelVersionOut


class ModelDeleteResponse(BaseModel):
    """Response returned when an inactive model version is deleted."""

    message: str
    deleted_version_id: str
