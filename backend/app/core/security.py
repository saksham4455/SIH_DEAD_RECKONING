from fastapi import Header, HTTPException, status

from app.config import Settings


def require_api_key(settings: Settings, x_api_key: str | None = Header(default=None)) -> None:
    if settings.api_key and x_api_key != settings.api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")
