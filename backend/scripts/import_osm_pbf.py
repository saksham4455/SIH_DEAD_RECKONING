#!/usr/bin/env python3
"""CLI utility to high-performance parse and import OpenStreetMap (.osm.pbf) files into PostgreSQL/PostGIS.

Extracts highway road networks (motorway, trunk, primary, secondary, tertiary, residential)
and converts line geometries into PostGIS MULTILINESTRING records with SRID 4326.
"""

import argparse
import asyncio
import logging
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import osmium
from geoalchemy2.elements import WKTElement
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, shutdown_db_client, startup_db_client
from app.models.road_network import RoadNetwork

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("import_osm_pbf")

ALLOWED_HIGHWAYS = {
    "motorway",
    "trunk",
    "primary",
    "secondary",
    "tertiary",
    "residential",
    "unclassified",
    "motorway_link",
    "trunk_link",
    "primary_link",
    "secondary_link",
}


class OSMHighwayHandler(osmium.SimpleHandler):
    """Osmium event handler extracting highway ways directly using C++ location cache."""

    def __init__(self) -> None:
        super().__init__()
        self.road_segments: list[dict] = []

    def way(self, w: osmium.osm.Way) -> None:
        highway_type = w.tags.get("highway")
        if not highway_type or highway_type not in ALLOWED_HIGHWAYS:
            return

        coords: list[list[float]] = []
        for n in w.nodes:
            try:
                if n.location.valid():
                    coords.append([n.location.lat, n.location.lon])
            except Exception:
                pass

        if len(coords) >= 2:
            road_name = w.tags.get("name") or w.tags.get("ref") or f"OSM Way {w.id}"
            max_speed_str = w.tags.get("maxspeed", "50")
            try:
                max_speed = int("".join(filter(str.isdigit, max_speed_str)) or "50")
            except ValueError:
                max_speed = 50

            self.road_segments.append(
                {
                    "id": str(w.id),
                    "name": road_name,
                    "highwayType": highway_type,
                    "speedLimitKmh": max_speed,
                    "coordinates": coords,
                }
            )


def construct_multilinestring_wkt(coords: list[list[float]]) -> WKTElement:
    """Convert [[lat, lon], ...] to PostGIS MULTILINESTRING WKT Element (SRID 4326)."""
    points_wkt = ", ".join(f"{pt[1]} {pt[0]}" for pt in coords)
    return WKTElement(f"MULTILINESTRING(({points_wkt}))", srid=4326)


async def import_pbf_file(file_path: Path, region_name: str) -> tuple[int, int]:
    """Parse .osm.pbf file and insert road network segments into PostGIS database."""
    if not file_path.exists():
        logger.error("File not found: %s", file_path)
        return (0, 0)

    logger.info("Parsing OSM PBF file: %s ...", file_path)
    handler = OSMHighwayHandler()
    handler.apply_file(str(file_path), locations=True)

    segments = handler.road_segments
    logger.info("Extracted %d highway road segments.", len(segments))

    if not segments:
        return (0, 0)

    await startup_db_client()

    inserted_count = 0
    skipped_count = 0

    try:
        async for session in get_db():
            batch: list[RoadNetwork] = []
            for seg in segments:
                coords = seg["coordinates"]
                try:
                    geom = construct_multilinestring_wkt(coords)
                    record = RoadNetwork(
                        region=region_name,
                        road_segments=[seg],
                        geom=geom,
                    )
                    batch.append(record)
                    inserted_count += 1

                    if len(batch) >= 500:
                        session.add_all(batch)
                        await session.commit()
                        batch.clear()
                        logger.info("Committed batch of 500 segments...")

                except Exception as err:
                    logger.warning("Skipped invalid segment %s: %s", seg["id"], err)
                    skipped_count += 1

            if batch:
                session.add_all(batch)
                await session.commit()
                logger.info("Committed final batch of %d segments.", len(batch))
            break
    finally:
        await shutdown_db_client()

    return (inserted_count, skipped_count)


def main() -> None:
    parser = argparse.ArgumentParser(description="Import OpenStreetMap .osm.pbf file into PostGIS")
    parser.add_argument("pbf_path", type=str, help="Path to the .osm.pbf file")
    parser.add_argument(
        "--region",
        type=str,
        default="Northern_India",
        help="Region identifier tag (default: Northern_India)",
    )
    args = parser.parse_args()

    pbf_file = Path(args.pbf_path)
    inserted, skipped = asyncio.run(import_pbf_file(pbf_file, args.region))
    logger.info("Import finished successfully: %d inserted, %d skipped.", inserted, skipped)


if __name__ == "__main__":
    main()
