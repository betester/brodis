from fastapi import WebSocket, WebSocketDisconnect

class WebsocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = {}

    async def connect(self, websocket: WebSocket,client_id : str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, websocket: WebSocket,client_id : str):
        del self.active_connections[client_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def send_to_target(self, message : str, target_id : str):
        await self.active_connections[target_id].send_text(message)

    async def broadcast(self, sender_id : str, message: str):
        for client_id, connection in self.active_connections.items():
            if client_id != sender_id:
                await connection.send_text(message)
