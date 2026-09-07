from datetime import datetime, timezone
import logging
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import SessionNotFoundError
from app.models.drive_session import DriveSession

logger = logging.getLogger("backend.services.session")


async def create_session(db: AsyncSession, metadata: dict | None = None) -> DriveSession:
    """Create and persist a new DriveSession with active status."""
    session = DriveSession(
        id=str(uuid4()),
        status="active",
        started_at=datetime.now(timezone.utc),
        stopped_at=None,
        metadata_json=metadata if metadata is not None else {},
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    logger.info("Created drive session %s", session.id)
    return session


async def get_session(db: AsyncSession, session_id: str) -> DriveSession | None:
    """Retrieve a DriveSession by primary key ID."""
    stmt = select(DriveSession).where(DriveSession.id == session_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def session_exists(db: AsyncSession, session_id: str) -> bool:
    """Check if a session exists in the database."""
    stmt = select(1).select_from(DriveSession).where(DriveSession.id == session_id)
    result = await db.execute(stmt)
    return result.scalar() is not None


async def stop_session(db: AsyncSession, session_id: str) -> DriveSession:
    """Update a DriveSession status to stopped with timestamp.

    Raises SessionNotFoundError if the session does not exist.
    """
    session = await get_session(db, session_id)
    if session is None:
        raise SessionNotFoundError(session_id)

    session.status = "stopped"
    session.stopped_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(session)
    logger.info("Stopped drive session %s at %s", session.id, session.stopped_at)
    return session
