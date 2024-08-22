import { Type } from "typescript"

export enum RaftStatus {
    FOLLOWER, CANDIDATE, LEADER
}

export interface TypeIdentifier {
    type: string
}

export interface LogRequest extends TypeIdentifier {
    leaderId: string
    term: number
}

export interface LogResponse extends TypeIdentifier {
    leaderId: string
    followerId: string
    term: number
    success: boolean
}

export interface VoteRequest extends TypeIdentifier {
    candidateId: string
    candidateTerm: number
    candidateLogLength: number
    candidateLogTerm: number
}

export interface VoteResponse extends TypeIdentifier {
    targetCandidate: string
    voterId: string
    term: number
    granted: boolean
}

export interface StopRaft extends TypeIdentifier {
    target : string
    members : string[]
    roomId : string
    room_leader : string
}