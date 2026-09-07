#!/usr/bin/env python3
"""CLI utility to manually seed demo road network data into PostgreSQL/PostGIS."""

import asyncio
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import get_db, shutdown_db_client, startup_db_client
from app.services.road_seed_service import seed_road_network


async def main() -> None:
    print("Initializing database engine...")
    await startup_db_client()

    try:
        async for session in get_db():
            print("Seeding road network into PostGIS...")
            inserted, skipped = await seed_road_network(session)
            print(f"Seed complete: {inserted} inserted, {skipped} skipped.")
            break
    finally:
        await shutdown_db_client()


if __name__ == "__main__":
    asyncio.run(main())
