from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import maps, models_hub, session, telemetry
from app.api.websockets import live_dashboard
from app.config import get_settings
from app.core.database import shutdown_db_client, startup_db_client


@asynccontextmanager
async def lifespan(application: FastAPI):
    application.state.database = await startup_db_client()
    application.state.ws_manager = live_dashboard.manager
    yield
    await shutdown_db_client()


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
    application.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
    application.include_router(telemetry.router, prefix="/api/v1")
    application.include_router(session.router, prefix="/api/v1")
    application.include_router(maps.router, prefix="/api/v1")
    application.include_router(models_hub.router, prefix="/api/v1")
    application.include_router(live_dashboard.router)

    @application.get("/health", tags=["system"])
    async def health() -> dict[str, str]:
        return {"status": "ok", "service": settings.app_name}

    return application


app = create_app()
