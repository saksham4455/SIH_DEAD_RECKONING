from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.api.websockets.ws_manager import ConnectionManager
from app.core.database import get_db
from app.services.replay_service import stream_replay_drive
from app.services.telemetry_service import get_session_telemetry

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
                async for db in get_db():
                    try:
                        records = await get_session_telemetry(db, session_id)
                        record_dicts = [r.model_dump(mode="json") for r in records]
                        async for record in stream_replay_drive(record_dicts):
                            await websocket.send_json(record)
                    except Exception:
                        pass
                    break
    except WebSocketDisconnect:
        manager.disconnect(websocket)
