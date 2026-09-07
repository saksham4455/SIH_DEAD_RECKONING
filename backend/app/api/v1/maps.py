from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.map_schema import CorridorResponse, MapUploadResponse
from app.services.map_query_service import MapQueryService

router = APIRouter(prefix="/maps", tags=["maps"])
map_service = MapQueryService()


@router.get("/corridor", response_model=CorridorResponse)
async def get_corridor(
    min_lat: float = Query(..., ge=-90.0, le=90.0, description="Minimum latitude"),
    min_lon: float = Query(..., ge=-180.0, le=180.0, description="Minimum longitude"),
    max_lat: float = Query(..., ge=-90.0, le=90.0, description="Maximum latitude"),
    max_lon: float = Query(..., ge=-180.0, le=180.0, description="Maximum longitude"),
    db: AsyncSession = Depends(get_db),
) -> CorridorResponse:
    if min_lat > max_lat or min_lon > max_lon:
        raise HTTPException(status_code=422, detail="Minimum bounds must not exceed maximum bounds")
    result = await map_service.query_roads_in_bbox(db, min_lat, min_lon, max_lat, max_lon)
    return CorridorResponse(**result)


@router.post("/upload-osm", response_model=MapUploadResponse)
async def upload_osm(file: UploadFile = File(...)) -> MapUploadResponse:
    if not file.filename or not file.filename.lower().endswith((".osm", ".pbf", ".json")):
        raise HTTPException(status_code=415, detail="Expected an OSM, PBF, or JSON map file")
    target_dir = Path(__file__).resolve().parents[3] / "data" / "maps"
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / f"{uuid4()}_{Path(file.filename).name}"
    content = await file.read()
    target.write_bytes(content)
    return MapUploadResponse(filename=file.filename, path=str(target), size_bytes=len(content))
