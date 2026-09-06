from redis.asyncio import Redis

from app.config import Settings


async def create_redis_client(settings: Settings) -> Redis | None:
    if not settings.redis_url:
        return None
    client = Redis.from_url(settings.redis_url, decode_responses=True)
    await client.ping()
    return client
