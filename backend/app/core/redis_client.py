import json
import logging
from redis.asyncio import Redis

from app.config import Settings

logger = logging.getLogger("backend.core.redis")

_redis_client: Redis | None = None


def get_redis_client() -> Redis | None:
    """Return the active global Redis client instance, if initialized."""
    return _redis_client


async def startup_redis_client(settings: Settings) -> Redis | None:
    """Initialize reusable async Redis connection pool if configured.

    Returns None without raising if redis_url is not configured or unreachable.
    """
    global _redis_client
    if not settings.redis_url:
        logger.info("Redis URL not configured; running without Redis real-time transport.")
        _redis_client = None
        return None

    try:
        client = Redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_connect_timeout=3.0,
            socket_timeout=3.0,
        )
        await client.ping()
        logger.info("Connected to Redis successfully.")
        _redis_client = client
        return _redis_client
    except Exception as exc:
        logger.warning("Failed to connect to Redis at %s: %s. Real-time transport will fall back to local mode.", settings.redis_url.split("@")[-1], exc)
        _redis_client = None
        return None


async def shutdown_redis_client() -> None:
    """Gracefully close the active Redis client connection pool."""
    global _redis_client
    if _redis_client is not None:
        try:
            await _redis_client.aclose()
            logger.info("Closed Redis client connection pool.")
        except Exception as exc:
            logger.warning("Error during Redis client shutdown: %s", exc)
        finally:
            _redis_client = None


async def ping_redis(client: Redis | None = None) -> bool:
    """Execute ping health check on given or global Redis client."""
    target_client = client if client is not None else _redis_client
    if target_client is None:
        return False
    try:
        return bool(await target_client.ping())
    except Exception as exc:
        logger.warning("Redis ping failed: %s", exc)
        return False


async def publish_telemetry_event(
    channel: str,
    event: dict,
    client: Redis | None = None,
) -> bool:
    """Publish a JSON-serialized telemetry event to the designated Redis channel.

    Auxiliary operation: catches all exceptions, logs a warning, and returns False
    without ever raising an exception or failing the caller.
    """
    target_client = client if client is not None else _redis_client
    if target_client is None:
        return False

    try:
        payload_str = json.dumps(event)
        await target_client.publish(channel, payload_str)
        return True
    except Exception as exc:
        logger.warning("Failed to publish telemetry event to Redis channel '%s': %s", channel, exc)
        return False
