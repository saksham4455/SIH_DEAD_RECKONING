from datetime import datetime, timezone
import logging

from geoalchemy2.elements import WKTElement
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import SessionNotFoundError
from app.models.drive_session import DriveSession
from app.models.telemetry_record import TelemetryRecord
from app.schemas.session_schema import SessionSummary
from app.schemas.telemetry_schema import TelemetryIn, TelemetryOut
from app.services.drift_analyzer import (
    calculate_drift_percentage,
    compute_max_absolute_error,
    compute_rmse,
)
from app.services.session_service import get_session, session_exists

logger = logging.getLogger("backend.services.telemetry")


def construct_point_geom(longitude: float, latitude: float) -> WKTElement:
    """Construct PostGIS geometry point with X=longitude, Y=latitude (SRID 4326)."""
    return WKTElement(f"POINT({longitude} {latitude})", srid=4326)


async def insert_telemetry(db: AsyncSession, payload: TelemetryIn) -> TelemetryOut:
    """Validate session existence and persist a single TelemetryRecord with PostGIS geometry.

    Raises SessionNotFoundError if the session_id does not exist in drive_sessions.
    """
    if not await session_exists(db, payload.session_id):
        raise SessionNotFoundError(payload.session_id)

    geom = construct_point_geom(payload.longitude, payload.latitude)
    record = TelemetryRecord(
        session_id=payload.session_id,
        timestamp=payload.timestamp,
        latitude=payload.latitude,
        longitude=payload.longitude,
        altitude=payload.altitude,
        speed=payload.speed,
        heading=payload.heading,
        confidence=payload.confidence,
        gnss_available=payload.gnss_available,
        mode=payload.mode,
        geom=geom,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    record_dict = payload.model_dump()
    record_dict["received_at"] = datetime.now(timezone.utc)
    return TelemetryOut(**record_dict)


async def insert_telemetry_batch(db: AsyncSession, batch: list[TelemetryIn]) -> list[TelemetryOut]:
    """Validate all referenced sessions and persist batch in a single database transaction.

    Rolls back the entire transaction if any insertion failure occurs.
    """
    if not batch:
        return []

    # Validate all referenced sessions upfront
    session_ids = {item.session_id for item in batch}
    stmt = select(DriveSession.id).where(DriveSession.id.in_(session_ids))
    result = await db.scalars(stmt)
    existing_ids = set(result.all())
    missing_ids = session_ids - existing_ids
    if missing_ids:
        missing_id = next(iter(missing_ids))
        logger.warning("Batch insertion rejected: session %s not found", missing_id)
        raise SessionNotFoundError(missing_id)

    now_utc = datetime.now(timezone.utc)
    db_records: list[TelemetryRecord] = []
    output_records: list[TelemetryOut] = []

    for item in batch:
        geom = construct_point_geom(item.longitude, item.latitude)
        record = TelemetryRecord(
            session_id=item.session_id,
            timestamp=item.timestamp,
            latitude=item.latitude,
            longitude=item.longitude,
            altitude=item.altitude,
            speed=item.speed,
            heading=item.heading,
            confidence=item.confidence,
            gnss_available=item.gnss_available,
            mode=item.mode,
            geom=geom,
        )
        db_records.append(record)

        record_dict = item.model_dump()
        record_dict["received_at"] = now_utc
        output_records.append(TelemetryOut(**record_dict))

    try:
        db.add_all(db_records)
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    logger.info("Persisted %d telemetry records in single batch transaction", len(db_records))
    return output_records


async def get_session_telemetry(db: AsyncSession, session_id: str) -> list[TelemetryOut]:
    """Query telemetry records for a session strictly ordered by timestamp ASC."""
    if not await session_exists(db, session_id):
        raise SessionNotFoundError(session_id)

    stmt = (
        select(TelemetryRecord)
        .where(TelemetryRecord.session_id == session_id)
        .order_by(TelemetryRecord.timestamp.asc())
    )
    result = await db.scalars(stmt)
    records = result.all()

    now_utc = datetime.now(timezone.utc)
    results: list[TelemetryOut] = []
    for r in records:
        ts = r.timestamp if r.timestamp.tzinfo is not None else r.timestamp.replace(tzinfo=timezone.utc)
        results.append(
            TelemetryOut(
                session_id=r.session_id,
                timestamp=ts,
                latitude=r.latitude,
                longitude=r.longitude,
                altitude=r.altitude,
                speed=r.speed,
                heading=r.heading,
                confidence=r.confidence,
                gnss_available=r.gnss_available,
                mode=r.mode,
                received_at=now_utc,
            )
        )
    return results



async def get_session_summary(db: AsyncSession, session_id: str) -> SessionSummary:
    """Retrieve persisted session and telemetry to compute session drift summary."""
    session = await get_session(db, session_id)
    if session is None:
        raise SessionNotFoundError(session_id)

    stmt = (
        select(TelemetryRecord)
        .where(TelemetryRecord.session_id == session_id)
        .order_by(TelemetryRecord.timestamp.asc())
    )
    result = await db.scalars(stmt)
    records = result.all()

    records_data = [
        {
            "confidence": r.confidence,
            "mode": r.mode,
            "speed": r.speed,
            "heading": r.heading,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "timestamp": r.timestamp,
        }
        for r in records
    ]

    started_at = session.started_at
    stopped_at = session.stopped_at or datetime.now(timezone.utc)
    if started_at is not None:
        if started_at.tzinfo is None and stopped_at.tzinfo is not None:
            started_at = started_at.replace(tzinfo=timezone.utc)
        elif started_at.tzinfo is not None and stopped_at.tzinfo is None:
            stopped_at = stopped_at.replace(tzinfo=timezone.utc)
        duration = (stopped_at - started_at).total_seconds()
    else:
        duration = 0.0

    return SessionSummary(
        id=session.id,
        status=session.status,
        started_at=session.started_at,
        stopped_at=session.stopped_at,
        metadata=session.metadata_json or {},
        telemetry_count=len(records),
        duration_seconds=max(0.0, duration),
        drift_rmse=compute_rmse(records_data),
        max_absolute_error=compute_max_absolute_error(records_data),
        drift_percentage=calculate_drift_percentage(records_data),
    )
