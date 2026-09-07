import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import maps, models_hub, session, telemetry
from app.api.websockets import live_dashboard
from app.config import Settings, get_settings
from app.core.database import get_store, shutdown_db_client, startup_db_client
from app.core.exceptions import register_exception_handlers
from app.core.middleware import RequestLoggingMiddleware

logger = logging.getLogger("backend.main")


@asynccontextmanager
async def lifespan(application: FastAPI):
    # Startup: initialize database engine and in-memory store, bind WebSocket manager
    application.state.database = await startup_db_client()
    application.state.ws_manager = live_dashboard.manager
    yield
    # Shutdown: dispose database engine
    await shutdown_db_client()


def register_middleware(application: FastAPI, settings: Settings) -> None:
    """Register application middleware in explicit order."""
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.add_middleware(RequestLoggingMiddleware)


def register_routers(application: FastAPI) -> None:
    """Register API and WebSocket routers."""
    application.include_router(telemetry.router, prefix="/api/v1")
    application.include_router(session.router, prefix="/api/v1")
    application.include_router(maps.router, prefix="/api/v1")
    application.include_router(models_hub.router, prefix="/api/v1")
    application.include_router(live_dashboard.router)


def register_system_routes(application: FastAPI, settings: Settings) -> None:
    """Register base health and metadata system endpoints."""

    @application.get("/health", tags=["system"])
    async def health() -> dict[str, str]:
        return {"status": "ok", "service": settings.app_name}

    @application.get("/", tags=["system"])
    async def root() -> dict[str, str]:
        return {"message": f"Welcome to {settings.app_name} API", "docs": "/docs", "health": "/health"}


def create_app() -> FastAPI:
    """Application factory constructing the authoritative FastAPI instance."""
    settings = get_settings()

    # Configure root logging format and level
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    application = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        lifespan=lifespan,
    )

    # Pre-initialize state defaults for safe direct ASGI inspection
    application.state.database = get_store()
    application.state.ws_manager = live_dashboard.manager

    register_middleware(application, settings)
    register_exception_handlers(application)
    register_routers(application)
    register_system_routes(application, settings)

    return application


app = create_app()
