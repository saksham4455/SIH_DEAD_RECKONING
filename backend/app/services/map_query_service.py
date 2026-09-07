import logging
from geoalchemy2 import functions as gf
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.road_network import RoadNetwork

logger = logging.getLogger("backend.services.map_query")


class MapQueryService:
    """Service performing PostGIS-backed spatial queries on road networks."""

    async def query_roads_in_bbox(
        self,
        db: AsyncSession,
        min_lat: float,
        min_lon: float,
        max_lat: float,
        max_lon: float,
        region: str | None = None,
    ) -> dict:
        """Query road network segments intersecting a spatial bounding box.

        Constructs an envelope polygon with SRID 4326 (X=longitude, Y=latitude)
        and evaluates ST_Intersects against the indexed RoadNetwork.geom.
        """
        envelope = gf.ST_MakeEnvelope(min_lon, min_lat, max_lon, max_lat, 4326)

        stmt = select(RoadNetwork).where(gf.ST_Intersects(RoadNetwork.geom, envelope))
        if region is not None:
            stmt = stmt.where(RoadNetwork.region == region)

        result = await db.scalars(stmt)
        records = result.all()

        if not records:
            return {"region": region or "none", "roadSegments": []}

        segments: list[dict] = []
        for r in records:
            if isinstance(r.road_segments, list):
                segments.extend(r.road_segments)
            elif isinstance(r.road_segments, dict):
                segments.append(r.road_segments)

        return {
            "region": records[0].region if records else (region or "none"),
            "roadSegments": segments,
        }

    async def find_nearest_roads(
        self,
        db: AsyncSession,
        latitude: float,
        longitude: float,
        limit: int = 5,
        max_distance_meters: float | None = None,
    ) -> list[dict]:
        """Prepared lookup helper for nearest road geometries (foundation for future map-matching)."""
        point = gf.ST_SetSRID(gf.ST_MakePoint(longitude, latitude), 4326)
        stmt = (
            select(RoadNetwork)
            .order_by(gf.ST_Distance(RoadNetwork.geom, point))
            .limit(limit)
        )
        if max_distance_meters is not None:
            stmt = stmt.where(gf.ST_DWithin(RoadNetwork.geom, point, max_distance_meters))

        result = await db.scalars(stmt)
        records = result.all()

        segments: list[dict] = []
        for r in records:
            if isinstance(r.road_segments, list):
                segments.extend(r.road_segments)
            elif isinstance(r.road_segments, dict):
                segments.append(r.road_segments)
        return segments
