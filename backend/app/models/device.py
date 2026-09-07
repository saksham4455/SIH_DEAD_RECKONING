import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Device(Base):
    """Declarative SQLAlchemy model tracking registered edge hardware devices and model pinning."""

    __tablename__ = "devices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    pinned_model_version_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("model_versions.id", ondelete="SET NULL"),
        nullable=True,
    )
