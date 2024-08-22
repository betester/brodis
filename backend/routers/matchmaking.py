from fastapi import APIRouter, Request, Depends, status, WebSocket
from dto.matchmaking import CreateSearchDto, UpdateSearchDto, CreateRoomDto, SearchDto
from sqlalchemy.orm import Session
from dependencies import get_db, verify_user_is_logged_in, get_db
from service import matchmaking
from managers import WebsocketManager
from fastapi import Depends
from sqlalchemy.orm import Session
import asyncio

router = APIRouter(
    prefix="/matchmaking",
    tags=["matchmaking"],
    responses={404: {"description": "Not found"}},
    dependencies=[Depends(verify_user_is_logged_in)],
)

# HTTP requests


@router.post("/search", status_code=status.HTTP_201_CREATED, response_model=SearchDto)
async def create_search(
    request: Request, data: CreateSearchDto, db: Session = Depends(get_db)
):
    return matchmaking.create_search(db, data)


@router.put("/search", status_code=status.HTTP_200_OK)
async def update_search(
    request: Request, data: UpdateSearchDto, db: Session = Depends(get_db)
):
    return matchmaking.update_search(db, data)


@router.post("/room", status_code=status.HTTP_201_CREATED)
async def create_room(
    request: Request, data: CreateRoomDto, db: Session = Depends(get_db)
):
    return matchmaking.create_room(db, data)


@router.get("/room")
async def get_joined_roomcreate_room(request: Request, db: Session = Depends(get_db)):
    return matchmaking.get_joined_room(db, request.state.user.email)


# Websocket requests

manager = WebsocketManager()


@router.websocket("/search/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            await matchmaking.handle_raft_request(data, manager)
    except Exception as e:
        manager.disconnect(websocket, client_id)


@router.websocket("/search")
async def currently_searching(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json({"current_searching": len(manager.active_connections)})
            await asyncio.sleep(10)
    except Exception as e:
        print(e)
        print("Client disconnected")
