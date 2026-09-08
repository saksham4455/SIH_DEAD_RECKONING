import asyncio
import json
import logging
import os
from redis.asyncio import Redis

from app.api.websockets.ws_manager import ConnectionManager

logger = logging.getLogger("backend.websockets.subscriber")


async def run_telemetry_subscriber(
    redis_client: Redis,
    manager: ConnectionManager,
    channel: str,
    stop_event: asyncio.Event | None = None,
) -> None:
    """Asynchronous background worker subscribing to Redis telemetry events and broadcasting to WebSockets.

    Features bounded exponential backoff on connection drops and graceful cancellation handling.
    """
    initial_backoff = 1.0
    max_backoff = 30.0
    backoff = initial_backoff

    while stop_event is None or not stop_event.is_set():
        pubsub = None
        subscriber_client = None
        try:
            # Use provided redis_client (e.g. mock/test client or shared instance), or create a dedicated Pub/Sub client
            if redis_client is not None:
                subscriber_client = redis_client
            else:
                subscriber_client = Redis.from_url(
                    os.getenv("SIH_REDIS_URL", "redis://cache:6379/"),
                    decode_responses=True,
                    socket_connect_timeout=3.0,
                    socket_timeout=None,
                )
            pubsub = subscriber_client.pubsub()
            await pubsub.subscribe(channel)
            logger.info("Subscribed to Redis telemetry channel: %s", channel)
            backoff = initial_backoff  # Reset backoff upon successful subscription

            async for message in pubsub.listen():
                if stop_event is not None and stop_event.is_set():
                    break

                if not message or message.get("type") != "message":
                    continue

                raw_data = message.get("data")
                if isinstance(raw_data, bytes):
                    raw_data = raw_data.decode("utf-8")

                if isinstance(raw_data, str):
                    try:
                        event = json.loads(raw_data)
                        if isinstance(event, dict):
                            await manager.broadcast(event)
                    except json.JSONDecodeError:
                        logger.warning("Discarding malformed JSON telemetry message from Redis: %s", raw_data)
                    except Exception as broadcast_err:
                        logger.warning("Error broadcasting telemetry event to WebSockets: %s", broadcast_err)

        except asyncio.CancelledError:
            logger.info("Redis telemetry subscriber received cancellation signal.")
            break
        except Exception as exc:
            logger.warning("Redis subscriber error on channel '%s': %s. Retrying in %.1fs...", channel, exc, backoff)
            try:
                await asyncio.sleep(backoff)
            except asyncio.CancelledError:
                break
            backoff = min(backoff * 2.0, max_backoff)
        finally:
            if pubsub is not None:
                try:
                    await pubsub.unsubscribe(channel)
                    if hasattr(pubsub, "aclose"):
                        await pubsub.aclose()
                    else:
                        await pubsub.close()
                except Exception as close_err:
                    logger.debug("Cleaned up pubsub subscription: %s", close_err)
            # Close the dedicated subscriber client if it was instantiated locally (not the passed-in client)
            if subscriber_client is not None and subscriber_client is not redis_client:
                try:
                    if hasattr(subscriber_client, "aclose"):
                        await subscriber_client.aclose()
                    else:
                        await subscriber_client.close()
                except Exception as close_err:
                    logger.debug("Closed subscriber Redis client: %s", close_err)

    logger.info("Redis telemetry subscriber task finished cleanly.")
