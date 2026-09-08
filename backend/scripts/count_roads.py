import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import func, select
from app.core.database import get_db, shutdown_db_client, startup_db_client
from app.models.road_network import RoadNetwork


async def main():
    await startup_db_client()
    try:
        async for session in get_db():
            cnt = await session.scalar(select(func.count()).select_from(RoadNetwork))
            print(f"Total Road Network Segments in PostGIS: {cnt}")
            break
    finally:
        await shutdown_db_client()


if __name__ == "__main__":
    asyncio.run(main())
