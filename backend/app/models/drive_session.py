from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .telemetry_record import TelemetryRecord


class DriveSession(Base):
    __tablename__ = "drive_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    status: Mapped[str] = mapped_column(String(32), default="active", index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    stopped_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)

    telemetry_records: Mapped[list["TelemetryRecord"]] = relationship(
        "TelemetryRecord",
        back_populates="session",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
