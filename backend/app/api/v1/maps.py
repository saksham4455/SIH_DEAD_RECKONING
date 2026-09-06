from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.map_schema import MapUploadResponse
from app.services.map_query_service import MapQueryService

router = APIRouter(prefix="/maps", tags=["maps"])
map_service = MapQueryService()


@router.get("/corridor")
async def get_corridor(min_lat: float, min_lon: float, max_lat: float, max_lon: float) -> dict:
    if min_lat > max_lat or min_lon > max_lon:
        raise HTTPException(status_code=422, detail="Minimum bounds must not exceed maximum bounds")
    return map_service.query_roads_in_bbox(min_lat, min_lon, max_lat, max_lon)


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
