from fastapi import WebSocket, WebSocketDisconnect
from src.schemas.ws import WSUser


class ConnectionManager:
    def __init__(self):
        self._user_wss: dict[int, set[WebSocket]] = {}
        self._ws_users: dict[WebSocket, WSUser] = {}

    async def connect(self, websocket: WebSocket, user: WSUser) -> None:
        await websocket.accept()
        self._ws_users[websocket] = user
        self._user_wss.setdefault(user.id, set()).add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        user = self._ws_users.pop(websocket, None)
        if user is None:
            return

        user_id = user.id
        conns = self._user_wss.get(user_id)
        if not conns:
            return

        conns.discard(websocket)
        if not conns:
            self._user_wss.pop(user_id, None)

    def get_user_id(self, websocket: WebSocket) -> int:
        return self._ws_users.get(websocket)

    def get_all_users(self) -> set[int]:
        return self._user_wss.keys()

    async def send_to_user(self, user_id: int, data: dict) -> None:
        """
        Отправить событие всем WebSocket'ам конкретного пользователя.
        """
        for ws in list(self._user_wss.get(user_id, set())):
            try:
                await ws.send_json(data)
            except (RuntimeError, WebSocketDisconnect):
                self.disconnect(ws)

    async def broadcast_to_users(self, user_ids: set[int], data: dict) -> None:
        """
        Отправить сообщение всем участникам чата по их активным WebSocket'ам.
        """
        for uid in user_ids:
            for ws in list(self._user_wss.get(uid, set())):
                await ws.send_json(data)

    async def broadcast_to_all_users(self, data: dict, exclude_id: int) -> None:
        """
        Отправить сообщение всем активным WebSocket'ам.
        """
        for ws in self._ws_users.keys():
            if exclude_id != self._ws_users.get(ws).id:
                await ws.send_json(data)


manager = ConnectionManager()
