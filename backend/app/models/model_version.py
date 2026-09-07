from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class ModelVersion(Base):
    """Declarative SQLAlchemy model tracking ML model artifacts, versions, and deployment state."""

    __tablename__ = "model_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    model_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    version: Mapped[str] = mapped_column(String(32), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(512), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    checksum_sha256: Mapped[str | None] = mapped_column(String(64), nullable=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    __table_args__ = (
        # Ensure version is unique within a given model_type
        UniqueConstraint("model_type", "version", name="uq_model_versions_type_version"),
        # Ensure at most one active model per model_type at the database level
        Index(
            "uq_active_model_per_type",
            "model_type",
            unique=True,
            postgresql_where=(is_active == True),
            sqlite_where=(is_active == True),
        ),
    )
