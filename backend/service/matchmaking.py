# TODO: implement matchmaking implementation using raft
from repository import matchmaking
from sqlalchemy.orm import Session
from dto.matchmaking import (
    CreateSearchDto,
    UpdateSearchDto,
    UpdateSearchResponse,
    VoteRequest,
    VoteResponse,
    LogRequest,
    LogResponse,
    CreateRoomDto,
    StopRaft
)
from models.matchmaking import Search,Room
from managers import WebsocketManager
import json
from typing import List


def create_search(db: Session, data: CreateSearchDto) -> Search:
    return matchmaking.create_search(db, data)


def update_search(db: Session, data: UpdateSearchDto):
    return UpdateSearchResponse(total_updated=matchmaking.update_search(db, data))

def create_room(db : Session, data : CreateRoomDto) -> Room:
    return matchmaking.create_room(db, data)

def get_joined_room(db : Session, user_id : str) -> List[Room]:
    return matchmaking.get_joined_room(db, user_id)

async def handle_log_request(message : str, manager : WebsocketManager):
    try:
        log_request : LogRequest = LogRequest.parse_obj(json.loads(message))
        await manager.broadcast(log_request.leader_id, message)
    except:
        return

async def handle_log_response(message : str, manager : WebsocketManager):
    try:
        log_response : LogResponse = LogResponse.parse_obj(json.loads(message))
        await manager.send_to_target(message, log_response.leader_id)
    except:
        return
    
async def handle_vote_response(message : str, manager : WebsocketManager):
    try:
        vote_response : VoteResponse = VoteResponse.parse_obj(json.loads(message))
        await manager.send_to_target(message, vote_response.target_candidate)
    except:
        return

async def handle_vote_request(message : str, manager : WebsocketManager):
    try:
        vote_request : VoteRequest = VoteRequest.parse_obj(json.loads(message))
        await manager.broadcast(vote_request.candidate_id, message)
    except Exception as e:
        return

async def handle_stop_raft(message : str, manager : WebsocketManager):
    try:
        stop_raft : StopRaft = StopRaft.parse_obj(json.loads(message))
        await manager.send_to_target(message, stop_raft.target)
    except:
        return


async def handle_raft_request(message : str, manager : WebsocketManager):
    await handle_log_request(message, manager)
    await handle_log_response(message, manager)
    await handle_vote_request(message, manager)
    await handle_vote_response(message, manager)
    await handle_stop_raft(message, manager)