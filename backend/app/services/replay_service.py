import asyncio
from collections.abc import AsyncIterator


async def stream_replay_drive(records: list[dict], delay_seconds: float = 0.1) -> AsyncIterator[dict]:
    for record in records:
        yield record
        await asyncio.sleep(delay_seconds)
