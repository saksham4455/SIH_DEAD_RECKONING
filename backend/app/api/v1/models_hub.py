from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/models", tags=["models"])


def model_directory() -> Path:
    return Path(__file__).resolve().parents[3] / "model_artifacts"


@router.get("/latest")
async def latest_model() -> dict:
    files = sorted(path for path in model_directory().iterdir() if path.is_file() and path.suffix in {".tflite", ".onnx"}) if model_directory().exists() else []
    if not files:
        raise HTTPException(status_code=404, detail="No model artifact is available")
    latest = files[-1]
    return {"filename": latest.name, "size_bytes": latest.stat().st_size}


@router.get("/download/{filename}")
async def download_model(filename: str) -> FileResponse:
    directory = model_directory().resolve()
    target = (directory / filename).resolve()
    if directory not in target.parents or not target.is_file():
        raise HTTPException(status_code=404, detail="Model artifact was not found")
    return FileResponse(target, filename=target.name, media_type="application/octet-stream")
