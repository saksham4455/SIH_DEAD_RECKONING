import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.api.v1 import maps, models_hub, session, telemetry
from app.api.websockets import live_dashboard
from app.api.websockets.subscriber import run_telemetry_subscriber
from app.config import Settings, get_settings
from app.core.database import get_db, get_store, shutdown_db_client, startup_db_client
from app.core.exceptions import register_exception_handlers
from app.core.middleware import RequestLoggingMiddleware
from app.core.redis_client import ping_redis, shutdown_redis_client, startup_redis_client

logger = logging.getLogger("backend.main")


@asynccontextmanager
async def lifespan(application: FastAPI):
    settings = get_settings()

    # Startup: initialize database engine and in-memory store, bind WebSocket manager
    application.state.database = await startup_db_client()
    application.state.ws_manager = live_dashboard.manager

    # Initialize Redis client if configured
    application.state.redis_client = await startup_redis_client(settings)
    if application.state.redis_client is not None:
        application.state.redis_subscriber_task = asyncio.create_task(
            run_telemetry_subscriber(
                redis_client=application.state.redis_client,
                manager=application.state.ws_manager,
                channel=settings.redis_telemetry_channel,
            ),
            name="redis_telemetry_subscriber",
        )
    else:
        application.state.redis_subscriber_task = None

    yield

    # Shutdown: stop subscriber task gracefully
    task = getattr(application.state, "redis_subscriber_task", None)
    if task is not None and not task.done():
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
        except Exception as exc:
            logger.warning("Error cancelling Redis subscriber task: %s", exc)

    # Dispose Redis and Database connections
    await shutdown_redis_client()
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
    """Register base health, readiness, and metadata system endpoints."""

    @application.get("/health", tags=["system"])
    async def health() -> dict[str, str]:
        return {"status": "ok", "service": settings.app_name}

    @application.get("/ready", tags=["system"])
    async def ready() -> JSONResponse:
        db_status = "ok"
        try:
            async for db_session in get_db():
                await db_session.execute(text("SELECT 1"))
                break
        except Exception:
            db_status = "error"

        redis_status = "disabled"
        redis_client = getattr(application.state, "redis_client", None)
        if settings.redis_url:
            is_up = redis_client is not None and await ping_redis(redis_client)
            redis_status = "ok" if is_up else "error"

        overall_ready = db_status == "ok"
        status_code = 200 if overall_ready else 503
        return JSONResponse(
            status_code=status_code,
            content={
                "status": "ready" if overall_ready else "degraded",
                "service": settings.app_name,
                "dependencies": {
                    "database": db_status,
                    "redis": redis_status,
                },
            },
        )

    @application.get("/", tags=["system"])
    async def root() -> dict[str, str]:
        return {
            "message": f"Welcome to {settings.app_name} API",
            "docs": "/docs",
            "health": "/health",
            "ready": "/ready",
        }


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
    application.state.redis_client = None
    application.state.redis_subscriber_task = None

    register_middleware(application, settings)
    register_exception_handlers(application)
    register_routers(application)
    register_system_routes(application, settings)

    return application


app = create_app()
