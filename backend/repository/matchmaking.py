from sqlalchemy.orm import Session
from dto.matchmaking import CreateSearchDto, UpdateSearchDto,CreateRoomDto
from models.matchmaking import Search, Room
from sqlalchemy import update
from typing import List

def create_search(db: Session, data: CreateSearchDto) -> Search:
    new_search = Search(user_id=data.user_id,target_member=data.target_member)
    db.add(new_search)
    db.commit()
    db.refresh(new_search)
    return new_search


def update_search(db: Session, data: UpdateSearchDto) -> int:
    result = db.execute(
        update(Search)
        .where(Search.id == data.id)
        .values(
            current_term=data.current_term, status=data.status, voted_for=data.voted_for
        )
    )
    db.commit()
    return result.rowcount

def create_room(db: Session, data: CreateRoomDto) -> Room:
    new_room = Room(room_leader=data.room_leader,members=data.members)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

def get_joined_room(db: Session, user_id: str) -> List[Room]:
    rooms =  db.query(Room).all()
    filtered_room = list(filter(lambda x : user_id in x.members, rooms))
    return filtered_room