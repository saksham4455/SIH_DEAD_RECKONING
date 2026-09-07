import json
import logging
from pathlib import Path

from geoalchemy2.elements import WKTElement
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.road_network import RoadNetwork

logger = logging.getLogger("backend.services.road_seed")


def get_default_roads_json_path() -> Path:
    """Resolve default path to demo road network JSON file."""
    # Try resolving relative to repository root
    repo_root = Path(__file__).resolve().parents[3]
    candidate = repo_root / "maps" / "demo-region" / "roads.json"
    if candidate.exists():
        return candidate
    return Path("maps/demo-region/roads.json")


def construct_multilinestring_geom(coordinates: list[list[float]]) -> WKTElement:
    """Construct PostGIS MULTILINESTRING geometry with SRID 4326.

    Input coordinates format: [[latitude, longitude], ...]
    PostGIS coordinate convention: X=longitude, Y=latitude.
    """
    if len(coordinates) < 2:
        raise ValueError("A road segment line requires at least 2 coordinate points.")

    # Convert [lat, lon] to 'lon lat'
    points_wkt = ", ".join(f"{pt[1]} {pt[0]}" for pt in coordinates)
    wkt_str = f"MULTILINESTRING(({points_wkt}))"
    return WKTElement(wkt_str, srid=4326)


async def seed_road_network(
    db: AsyncSession,
    json_path: Path | None = None,
) -> tuple[int, int]:
    """Idempotently seed demo road network segments into PostGIS road_networks table.

    Returns:
        tuple[int, int]: (inserted_count, skipped_count)
    """
    target_path = json_path if json_path is not None else get_default_roads_json_path()
    if not target_path.exists():
        logger.warning("Road seed file not found at: %s", target_path)
        return (0, 0)

    try:
        raw_content = target_path.read_text(encoding="utf-8-sig")
        data = json.loads(raw_content)
    except Exception as exc:
        logger.error("Failed to read road seed file %s: %s", target_path, exc)
        return (0, 0)

    region = data.get("region", "demo")
    segments = data.get("roadSegments", [])
    if not segments:
        logger.info("No road segments found in seed data.")
        return (0, 0)

    # Query existing segments in this region to ensure idempotency
    stmt = select(RoadNetwork).where(RoadNetwork.region == region)
    result = await db.scalars(stmt)
    existing_rows = result.all()

    existing_segment_ids: set[str] = set()
    for row in existing_rows:
        if isinstance(row.road_segments, list):
            for seg in row.road_segments:
                if isinstance(seg, dict) and "id" in seg:
                    existing_segment_ids.add(str(seg["id"]))

    inserted_count = 0
    skipped_count = 0

    for seg in segments:
        seg_id = str(seg.get("id")) if seg.get("id") is not None else None
        if seg_id and seg_id in existing_segment_ids:
            skipped_count += 1
            continue

        coords = seg.get("coordinates", [])
        if len(coords) < 2:
            logger.warning("Skipping segment %s with insufficient coordinates: %s", seg_id, coords)
            skipped_count += 1
            continue

        try:
            geom = construct_multilinestring_geom(coords)
            record = RoadNetwork(
                region=region,
                road_segments=[seg],
                geom=geom,
            )
            db.add(record)
            inserted_count += 1
            if seg_id:
                existing_segment_ids.add(seg_id)
        except Exception as geom_err:
            logger.warning("Failed to construct geometry for segment %s: %s", seg_id, geom_err)
            skipped_count += 1

    if inserted_count > 0:
        await db.commit()
        logger.info("Seeded %d new road segments into road_networks (skipped %d)", inserted_count, skipped_count)
    else:
        logger.info("Road network already up to date. (skipped %d existing)", skipped_count)

    return (inserted_count, skipped_count)
