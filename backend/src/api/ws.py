import json

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from pydantic import ValidationError
from src.core.dependencies import get_ws_user
from src.schemas.ws import (
    MessageSendEvent,
    MessagesFetchEvent,
    ReadEvent,
    TypingEvent,
    WSUser,
    event_adapter,
)
from src.services.ws.ws_manager import manager
from src.services.ws.ws_service import WSService

router = APIRouter()


@router.websocket("/ws/chats")
async def websocket_endpoint(
    websocket: WebSocket,
    service: WSService = Depends(),
    user: WSUser = Depends(get_ws_user),
):
    await manager.connect(websocket=websocket, user=user)

    try:
        while True:
            try:
                data = await websocket.receive_json()
            except json.JSONDecodeError:
                await manager.send_to_user(
                    user.id,
                    {
                        "event": "error",
                        "code": "invalid_json",
                        "message": "Invalid JSON",
                    },
                )
                continue

            try:
                event_obj = event_adapter.validate_python(data)
            except ValidationError as e:
                await manager.send_to_user(
                    user.id,
                    {
                        "event": "error",
                        "code": "validation_error",
                        "message": "Invalid payload",
                        "details": e.errors(),
                    },
                )
                continue

            if isinstance(event_obj, MessageSendEvent):
                await service.handle_message_send(event=event_obj, user=user)
            elif isinstance(event_obj, TypingEvent):
                await service.handle_typing(event=event_obj, user=user)
            elif isinstance(event_obj, ReadEvent):
                await service.handle_reading(event=event_obj, user=user)
            elif isinstance(event_obj, MessagesFetchEvent):
                await service.handle_messages_fetch(event=event_obj, user=user)
            else:
                await manager.send_to_user(
                    user.id,
                    {
                        "event": "error",
                        "code": "unknown_event",
                        "message": f"Unsupported event: {event_obj.event}",
                    },
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket)
