from sqlalchemy import  Column, Integer, String, Enum, UUID,JSON
import enum
from db import Base
import uuid


class SearchStatus(enum.Enum):
    SEARCHING="SEARCHING"
    FOUND="FOUND"
    
class Search(Base):
    __tablename__ = "search"
    id = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    user_id = Column(String, nullable=False) 
    current_term = Column(Integer,default=0)
    voted_for = Column(String)
    status = Column(Enum(SearchStatus),default=SearchStatus.SEARCHING)
    target_member = Column(Integer)
class Room(Base):
    __tablename__ = "room"
    id = Column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    room_leader = Column(String,nullable=False)
    members = Column(JSON)