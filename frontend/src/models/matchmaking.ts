import { RaftStatus } from "./raft"

export enum SearchStatus {
    SEARCHING,FOUND
}

export interface Search {
    id : string
    userId? : string
    currentTerm : number
    votedFor : string | null
    status? : SearchStatus
    targetMember? : number
}

export interface SearchProgress {
    id : string;
    members : Set<string>
    targetMember : number;
    raftStatus : RaftStatus;   
}

export interface Room {
    id? : string
    roomLeader : string
    members : string[]
}