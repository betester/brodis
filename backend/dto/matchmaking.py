from pydantic import BaseModel, Field,UUID4
from models.matchmaking import SearchStatus
from typing import List,Union


class CamelModel(BaseModel):
    class Config:
        orm_mode=True
        allow_population_by_field_name = True
        alias_generator = (
            lambda field_name: field_name[:1].lower() + field_name[1:]
            if field_name[0].isupper()
            else field_name
        )


class CreateSearchDto(CamelModel):
    user_id: str = Field(alias="userId")
    target_member: int = Field(alias="targetMember")


class UpdateSearchDto(CamelModel):
    id: str
    status: SearchStatus
    voted_for: str = Field(alias="votedFor")
    current_term: int = Field(alias="currentTerm")


class CreateRoomDto(CamelModel):
    room_leader: str = Field(alias="roomLeader")
    members: List[str]


class UpdateSearchResponse(CamelModel):
    total_updated: int = Field(alias="totalUpdated")

class SearchDto(CamelModel):
    id :  UUID4
    user_id : str = Field(alias="userId")  
    current_term  : int = Field(alias='currentTerm')
    voted_for : Union[str,None] = Field(alias="votedFor",default=None)
    target_member : int = Field(alias="targetMember")


class VoteRequest(CamelModel):
    candidate_id: str = Field(alias="candidateId")
    candidate_term: int = Field(alias="candidateTerm")
    candidate_log_length: int = Field(alias="candidateLogLength")
    candidate_log_term: int = Field(alias="candidateLogTerm")


class VoteResponse(CamelModel):
    target_candidate: str = Field(alias="targetCandidate")
    voter_id: str = Field(alias="voterId")
    term: int
    granted: bool


class LogRequest(CamelModel):
    leader_id: str = Field(alias="leaderId")
    term: int


class LogResponse(CamelModel):
    leader_id: str = Field(alias="leaderId")
    follower_id: str = Field(alias="followerId")
    term: int
    success: bool

class StopRaft(CamelModel):
    target : str
    members : List[str]
    room_id : str = Field(alias="roomId")

