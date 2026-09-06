from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.api.websockets.ws_manager import ConnectionManager
from app.core.database import get_store
from app.services.replay_service import stream_replay_drive

router = APIRouter(tags=["live dashboard"])
manager = ConnectionManager()


@router.websocket("/ws/judge-dashboard")
async def judge_dashboard(websocket: WebSocket, session_id: str | None = None) -> None:
    await manager.connect(websocket)
    try:
        await websocket.send_json({"type": "connected", "session_id": session_id})
        while True:
            message = await websocket.receive_json()
            if message.get("action") == "replay" and session_id:
                records = await get_store().get_telemetry(session_id)
                async for record in stream_replay_drive(records):
                    await websocket.send_json(record)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
