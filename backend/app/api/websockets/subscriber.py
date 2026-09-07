import asyncio
import json
import logging
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
        try:
            pubsub = redis_client.pubsub()
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
                    await pubsub.close()
                except Exception as close_err:
                    logger.debug("Cleaned up pubsub subscription: %s", close_err)

    logger.info("Redis telemetry subscriber task finished cleanly.")
