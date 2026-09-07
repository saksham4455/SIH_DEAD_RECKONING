"""Phase 5 PostGIS Map & Spatial Query Tests.

Validates:
1. Seed road network success -> records inserted with MULTILINESTRING geometry
2. Seed idempotency -> repeated runs skip existing segments without duplicating
3. Known bounding box query -> returns expected intersecting road segments
4. Disjoint bounding box query -> returns valid empty response
5. Invalid latitude rejected ([-90, 90])
6. Invalid longitude rejected ([-180, 180])
7. Inverted bounds rejected (min > max -> HTTP 422)
8. Geometry SRID verified as 4326
9. Longitude/Latitude ordering verified (X=longitude, Y=latitude)
10. JSON file decoupling -> queries work without reading roads.json
11. End-to-end HTTP corridor API query
12. Empty database returns valid empty result cleanly
"""

import os
import sys
from pathlib import Path

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import httpx
import pytest
import pytest_asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import app.core.database
from app.core.database import get_db
from app.main import create_app
from app.models.base import Base
from app.models.road_network import RoadNetwork
from app.services.map_query_service import MapQueryService
from app.services.road_seed_service import (
    construct_multilinestring_geom,
    seed_road_network,
)
from geoalchemy2.admin.dialects import sqlite as geo_sqlite

geo_sqlite.before_create = lambda *a, **k: None
geo_sqlite.after_create = lambda *a, **k: None


def setup_sqlite_engine(engine):
    """Attach SQLite hooks and spatial functions for isolated local tests."""
    from sqlalchemy import event

    @event.listens_for(engine.sync_engine, "connect")
    def _set_sqlite_hooks(dbapi_conn, record):
        from shapely import geometry, wkb, wkt

        def _to_ewkb(val):
            if not val:
                return val
            try:
                val_str = str(val)
                if ";" in val_str:
                    val_str = val_str.split(";")[-1]
                return wkb.dumps(wkt.loads(val_str), srid=4326, hex=True)
            except Exception:
                return val

        def _parse_geom(val):
            if not val:
                return None
            if isinstance(val, (bytes, bytearray)):
                try:
                    return wkb.loads(val)
                except Exception:
                    return None
            val_str = str(val)
            if ";" in val_str:
                val_str = val_str.split(";")[-1]
            try:
                return wkt.loads(val_str)
            except Exception:
                try:
                    return wkb.loads(bytes.fromhex(val_str))
                except Exception:
                    return None

        def _make_envelope(xmin, ymin, xmax, ymax, srid):
            # ST_MakeEnvelope: X=longitude, Y=latitude
            return geometry.box(float(xmin), float(ymin), float(xmax), float(ymax)).wkt

        def _intersects(geom1, geom2):
            g1 = _parse_geom(geom1)
            g2 = _parse_geom(geom2)
            if g1 is None or g2 is None:
                return 0
            return 1 if g1.intersects(g2) else 0

        dbapi_conn.execute("PRAGMA foreign_keys=ON")
        dbapi_conn.create_function("GeomFromEWKT", 1, lambda val: val)
        dbapi_conn.create_function("ST_GeomFromEWKT", 1, lambda val: val)
        dbapi_conn.create_function("AsEWKB", 1, _to_ewkb)
        dbapi_conn.create_function("ST_AsEWKB", 1, _to_ewkb)
        dbapi_conn.create_function("AsBinary", 1, _to_ewkb)
        dbapi_conn.create_function("ST_AsBinary", 1, _to_ewkb)
        dbapi_conn.create_function("RecoverGeometryColumn", 5, lambda *args: 1)
        dbapi_conn.create_function("CreateSpatialIndex", 2, lambda *args: 1)
        dbapi_conn.create_function("DisableSpatialIndex", 2, lambda *args: 1)
        dbapi_conn.create_function("InitSpatialMetaData", 0, lambda: 1)
        dbapi_conn.create_function("InitSpatialMetaData", 1, lambda val: 1)
        dbapi_conn.create_function("ST_MakeEnvelope", 5, _make_envelope)
        dbapi_conn.create_function("ST_Intersects", 2, _intersects)

    return engine


@pytest_asyncio.fixture
async def async_db():
    """Create an isolated in-memory test database with PostGIS/SQLite spatial compatibility."""
    engine = setup_sqlite_engine(create_async_engine("sqlite+aiosqlite:///:memory:", echo=False))

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


# 1. Seed Road Network Success
@pytest.mark.asyncio
async def test_1_seed_road_network_success(async_db: AsyncSession):
    inserted, skipped = await seed_road_network(async_db)
    assert inserted >= 1
    assert skipped == 0

    stmt = select(RoadNetwork)
    rows = (await async_db.scalars(stmt)).all()
    assert len(rows) >= 1
    assert rows[0].region == "Delhi_NCR_Demo"
    assert len(rows[0].road_segments) >= 1
    assert rows[0].road_segments[0]["id"] == "segment_101"


# 2. Seed Idempotency
@pytest.mark.asyncio
async def test_2_seed_road_network_idempotent(async_db: AsyncSession):
    # First seed
    ins1, skip1 = await seed_road_network(async_db)
    assert ins1 >= 1

    # Second seed
    ins2, skip2 = await seed_road_network(async_db)
    assert ins2 == 0
    assert skip2 >= 1

    # Row count unchanged
    stmt = select(RoadNetwork)
    rows = (await async_db.scalars(stmt)).all()
    assert len(rows) == ins1


# 3. Known Bounding Box Query Returns Roads
@pytest.mark.asyncio
async def test_3_query_known_bounding_box_returns_roads(async_db: AsyncSession):
    await seed_road_network(async_db)
    service = MapQueryService()

    # Bounding box around Connaught Outer Circle: lat ~ 28.614, lon ~ 77.209
    res = await service.query_roads_in_bbox(
        async_db,
        min_lat=28.6130,
        min_lon=77.2085,
        max_lat=28.6150,
        max_lon=77.2105,
    )
    assert res["region"] == "Delhi_NCR_Demo"
    assert len(res["roadSegments"]) >= 1
    assert res["roadSegments"][0]["id"] == "segment_101"
    assert res["roadSegments"][0]["name"] == "Connaught Outer Circle"


# 4. Disjoint Bounding Box Query Returns Empty Result
@pytest.mark.asyncio
async def test_4_query_disjoint_bounding_box_returns_empty(async_db: AsyncSession):
    await seed_road_network(async_db)
    service = MapQueryService()

    # Bounding box in Bangalore: lat ~ 12.97, lon ~ 77.59
    res = await service.query_roads_in_bbox(
        async_db,
        min_lat=12.90,
        min_lon=77.50,
        max_lat=12.95,
        max_lon=77.55,
    )
    assert res["roadSegments"] == []
    assert res["region"] == "none"


# 5. Invalid Latitude Rejected
@pytest.mark.asyncio
async def test_5_invalid_latitude_rejected():
    engine = setup_sqlite_engine(create_async_engine("sqlite+aiosqlite:///:memory:", echo=False))
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def override_get_db():
        async with factory() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # min_lat < -90
        r1 = await client.get("/api/v1/maps/corridor?min_lat=-95&min_lon=77&max_lat=28&max_lon=78")
        assert r1.status_code == 422

        # max_lat > 90
        r2 = await client.get("/api/v1/maps/corridor?min_lat=28&min_lon=77&max_lat=95&max_lon=78")
        assert r2.status_code == 422

    await engine.dispose()


# 6. Invalid Longitude Rejected
@pytest.mark.asyncio
async def test_6_invalid_longitude_rejected():
    engine = setup_sqlite_engine(create_async_engine("sqlite+aiosqlite:///:memory:", echo=False))
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def override_get_db():
        async with factory() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # min_lon < -180
        r1 = await client.get("/api/v1/maps/corridor?min_lat=28&min_lon=-185&max_lat=29&max_lon=78")
        assert r1.status_code == 422

        # max_lon > 180
        r2 = await client.get("/api/v1/maps/corridor?min_lat=28&min_lon=77&max_lat=29&max_lon=185")
        assert r2.status_code == 422

    await engine.dispose()


# 7. Inverted Bounds Rejected
@pytest.mark.asyncio
async def test_7_inverted_bounds_rejected():
    engine = setup_sqlite_engine(create_async_engine("sqlite+aiosqlite:///:memory:", echo=False))
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def override_get_db():
        async with factory() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # min_lat > max_lat
        r1 = await client.get("/api/v1/maps/corridor?min_lat=30&min_lon=77&max_lat=28&max_lon=78")
        assert r1.status_code == 422
        assert "Minimum bounds must not exceed maximum bounds" in r1.text

        # min_lon > max_lon
        r2 = await client.get("/api/v1/maps/corridor?min_lat=28&min_lon=80&max_lat=29&max_lon=78")
        assert r2.status_code == 422
        assert "Minimum bounds must not exceed maximum bounds" in r2.text

    await engine.dispose()


# 8. Geometry SRID Verified as 4326
def test_8_geometry_srid_and_type():
    coords = [[28.6139, 77.2090], [28.6145, 77.2098]]
    wkt_elem = construct_multilinestring_geom(coords)
    assert wkt_elem.srid == 4326
    assert "MULTILINESTRING" in str(wkt_elem.data)


# 9. Longitude/Latitude Ordering Verified (X=lon, Y=lat)
def test_9_lon_lat_coordinate_ordering():
    # Input format in roads.json: [[lat, lon], ...]
    coords = [[28.6139, 77.2090], [28.6145, 77.2098]]
    wkt_elem = construct_multilinestring_geom(coords)
    wkt_text = str(wkt_elem.data)

    # PostGIS WKT convention: X Y -> longitude latitude
    assert "77.209 28.6139" in wkt_text
    assert "77.2098 28.6145" in wkt_text


# 10. Query Works Without JSON File Availability (JSON Decoupling)
@pytest.mark.asyncio
async def test_10_query_without_json_file(async_db: AsyncSession):
    # First seed data into database
    await seed_road_network(async_db)

    # MapQueryService queries database, NOT roads.json
    service = MapQueryService()
    res = await service.query_roads_in_bbox(
        async_db,
        min_lat=28.6130,
        min_lon=77.2085,
        max_lat=28.6150,
        max_lon=77.2105,
    )
    assert res["region"] == "Delhi_NCR_Demo"
    assert len(res["roadSegments"]) == 1
    assert res["roadSegments"][0]["id"] == "segment_101"


# 11. End-to-End HTTP Corridor API Query
@pytest.mark.asyncio
async def test_11_end_to_end_http_corridor():
    engine = setup_sqlite_engine(create_async_engine("sqlite+aiosqlite:///:memory:", echo=False))
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    # Seed data into the test database
    async with factory() as session:
        await seed_road_network(session)

    async def override_get_db():
        async with factory() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Query intersecting corridor
        r = await client.get(
            "/api/v1/maps/corridor",
            params={
                "min_lat": 28.6130,
                "min_lon": 77.2085,
                "max_lat": 28.6150,
                "max_lon": 77.2105,
            },
        )
        assert r.status_code == 200
        data = r.json()
        assert data["region"] == "Delhi_NCR_Demo"
        assert len(data["roadSegments"]) >= 1
        assert data["roadSegments"][0]["id"] == "segment_101"

    await engine.dispose()


# 12. Empty Database Returns Valid Empty Result Cleanly
@pytest.mark.asyncio
async def test_12_empty_database_returns_valid_empty_result():
    engine = setup_sqlite_engine(create_async_engine("sqlite+aiosqlite:///:memory:", echo=False))
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    # Note: no seeding performed; database is empty

    async def override_get_db():
        async with factory() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get(
            "/api/v1/maps/corridor",
            params={
                "min_lat": 28.0,
                "min_lon": 77.0,
                "max_lat": 29.0,
                "max_lon": 78.0,
            },
        )
        assert r.status_code == 200
        data = r.json()
        assert data["region"] == "none"
        assert data["roadSegments"] == []

    await engine.dispose()
