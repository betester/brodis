import { LogRequest, LogResponse, RaftStatus, Search, StopRaft, VoteRequest, VoteResponse } from "@/models";
import { baseWsUrl } from "@/pages/api/hello";
import { getRandomFloat } from "@/utils";
import { EventEmitter } from "stream";
import { createRoom } from "./matchmaking";

export class Raft {
    id: string;
    log: LogRequest[];
    votedFor: string | null;
    faultDuration: number;
    heartBeatDuration: number;
    websocket: WebSocket
    currentLeader: string | null;
    currentRole: RaftStatus;
    votesReceived: Set<string>;
    leaderHasSentHeartBeat: boolean;
    electionIsCancelled: boolean;
    currentTerm: number;
    searchId: string;
    targetMember: number
    raftEvent: EventEmitter

    constructor(
        search: Search,
        faultDuration: number,
        heartBeatDuration: number,
        raftEvent: EventEmitter
    ) {
        this.faultDuration = faultDuration;
        this.heartBeatDuration = heartBeatDuration;

        // persistent values
        this.targetMember = search.targetMember!;
        this.searchId = search.id;
        this.currentTerm = search.currentTerm;
        this.id = search.userId!;
        this.votedFor = search.votedFor;
        this.log = [];
        // volatile values
        this.raftEvent = raftEvent;
        this.websocket = new WebSocket(`${baseWsUrl}/matchmaking/search/${this.id}`);
        this.currentLeader = null;
        this.currentRole = RaftStatus.FOLLOWER;
        this.votesReceived = new Set();

        //flag
        this.leaderHasSentHeartBeat = false;
        this.electionIsCancelled = true;
    }

    async volunteerAsLeader() {
        this.currentTerm += 1;
        this.currentRole = RaftStatus.CANDIDATE;
        this.electionIsCancelled = false;
        this.votedFor = this.id;
        this.votesReceived = new Set();
        this.votesReceived.add(this.id);

        let lastTerm = 0;

        if (this.log.length > 0) {
            lastTerm = this.log[this.log.length - 1].term;
        }

        const message: VoteRequest = {
            candidateId: this.id,
            candidateTerm: this.currentTerm,
            candidateLogLength: this.log.length,
            candidateLogTerm: lastTerm,
            type: "VoteRequest"
        }
        this.websocket.send(JSON.stringify(message));
    }

    async broadCastMessage() {
        if (this.currentRole === RaftStatus.LEADER && this.votesReceived.size != this.targetMember) {
            console.log("Sending message to follower");
            const logRequest: LogRequest = {
                leaderId: this.id,
                term: this.currentTerm,
                type: "LogRequest"
            };
            this.websocket.send(JSON.stringify(logRequest));
        }
        else {
            await this.readyToCreateRoom();    
        }
        await new Promise((r) => setTimeout(r, this.heartBeatDuration));
    }

    async leaderIsSuspectedToFail() {
        if (this.currentRole === RaftStatus.FOLLOWER) {
            const randomTimeOut = getRandomFloat(4, 10) * 1000;
            await new Promise((r) => setTimeout(r, randomTimeOut));
            if (!this.leaderHasSentHeartBeat) {
                console.log("There seems to be no room, creating my own room");
                this.volunteerAsLeader();
            }
            this.leaderHasSentHeartBeat = false;
        }
    }

    async electionHasTimedOut() {
        if (this.currentRole === RaftStatus.CANDIDATE) {
            const randomTimeOut = getRandomFloat(4, 10) * 1000;
            await new Promise((r) => setTimeout(r, randomTimeOut));
            if (!this.electionIsCancelled) {
                console.log("Election is not cancelled, will retry");
                this.volunteerAsLeader();
            }
        }
    }

    receiveVoteRequest(voteRequest: VoteRequest) {
        console.log(`user ${voteRequest.candidateId} sent a vote request`);

        if (voteRequest.candidateTerm > this.currentTerm) {
            console.log(`user ${voteRequest.candidateId} search first than me`);
            console.log(
                `changing term from ${this.currentTerm} to ${voteRequest.candidateTerm}`
            );
            this.currentTerm = voteRequest.candidateTerm;
            this.currentRole = RaftStatus.FOLLOWER;
            this.votedFor = null;
            this.votesReceived = new Set();
        }

        let lastTerm = 0;

        if (this.log.length > 0) {
            lastTerm = this.log[this.log.length - 1].term;
        }

        const logIsOk =
            voteRequest.candidateLogTerm > lastTerm ||
            (voteRequest.candidateLogTerm == lastTerm &&
                voteRequest.candidateLogLength >= this.log.length);

        const candidateCanBeVoted =
            voteRequest.candidateTerm == this.currentTerm &&
            logIsOk &&
            [null, voteRequest.candidateId].includes(this.votedFor);

        const voteResponse: VoteResponse = {
            targetCandidate: voteRequest.candidateId,
            voterId: this.id,
            term: this.currentTerm,
            granted: true,
            type: "VoteResponse"
        }

        if (candidateCanBeVoted) {
            console.log(`I will join the room created by ${voteRequest.candidateId}`);
            this.votedFor = voteRequest.candidateId;

            return this.websocket.send(
                JSON.stringify(
                    voteResponse
                )
            );
        } else {
            voteResponse.granted = false;
            return this.websocket.send(
                JSON.stringify(
                    voteResponse
                )
            );
        }
    }

    receiveLogRequest(logRequest: LogRequest) {

        if (logRequest.term > this.currentTerm) {
            this.currentTerm = logRequest.term;
            this.votedFor = null;
            this.electionIsCancelled = true;
        }

        const logResponse: LogResponse = {
            leaderId: logRequest.leaderId,
            followerId: this.id,
            term: this.currentTerm,
            success: true,
            type: "LogResponse"
        }

        if (logRequest.term == this.currentTerm) {
            this.currentRole = RaftStatus.FOLLOWER;
            this.currentLeader = logRequest.leaderId;
            this.websocket.send(JSON.stringify(logResponse));
        } else {
            logResponse.success = false;
            this.websocket.send(JSON.stringify(logResponse));
        }

        this.leaderHasSentHeartBeat = true;
    }

    async readyToCreateRoom() {
        if (this.votesReceived.size == this.targetMember) {
            const members = Array.from(this.votesReceived)
            const createdRoom = await createRoom({
                members: members,
                roomLeader: this.id
            })

            if (createdRoom) {
                for (const member of members) {
                    const stopRaft: StopRaft = {
                        members: members,
                        target: member,
                        roomId: createdRoom.id!,
                        room_leader: this.id,
                        type: "StopRaft"
                    }
                    this.websocket.send(JSON.stringify(stopRaft))
                }
                console.log("Searching is done, will close the websocket");
                this.websocket.close();
                this.raftEvent.emit("stopRaft", {
                    room_leader: this.id,
                    id: createdRoom.id,
                    members: members
                })
            }
        }
    }

    async receiveLogResponse(logResponse: LogResponse) {
        if (
            this.currentTerm == logResponse.term &&
            this.currentRole === RaftStatus.LEADER &&
            logResponse.leaderId === this.id
        ) {
            if (logResponse.success && this.votesReceived.size < this.targetMember) {
                this.votesReceived.add(logResponse.followerId);
            }
        } else if (logResponse.term > this.currentTerm) {
            this.currentTerm = logResponse.term;
            this.currentRole = RaftStatus.FOLLOWER;
            this.votedFor = null;
            this.electionIsCancelled = true;
        }
    }

    receiveVoteResponse(voteResponse: VoteResponse) {
        console.log(voteResponse);
        console.log(`Receive vote response from user ${voteResponse.voterId}`);

        if (
            this.currentRole === RaftStatus.CANDIDATE &&
            this.currentTerm == voteResponse.term &&
            voteResponse.granted
        ) {
            console.log(`Add vote from user ${voteResponse.voterId}`);
            this.votesReceived.add(voteResponse.voterId);
            // for the moment is 3
            if (this.votesReceived.size >= Math.ceil(this.targetMember / 2)) {
                console.log("Become room leader");
                this.currentRole = RaftStatus.LEADER;
                this.currentLeader = this.id;
                this.electionIsCancelled = true;
                const logRequest: LogRequest = { leaderId: this.id, term: this.currentTerm, type: "LogRequest" };
                this.websocket.send(JSON.stringify(logRequest));
            }
        } else if (voteResponse.term > this.currentTerm) {
            this.currentTerm = voteResponse.term;
            this.currentRole = RaftStatus.FOLLOWER;
            this.votedFor = null;
            this.electionIsCancelled = true;
        }
    }

    async timeoutHandler() {
        while (this.websocket.readyState == 1) {
            await this.leaderIsSuspectedToFail();
            await this.electionHasTimedOut();
            await this.broadCastMessage();


            const sentData = {
                id: this.id,
                members: this.votesReceived,
                targetMember: this.targetMember,
                raftStatus: this.currentRole
            }

            this.raftEvent.emit('raft', sentData);
        }

        this.raftEvent.emit("deleteSearch", {
            id: this.id
        })

    }



    async listeningProcedure(event: MessageEvent) {
        const data = JSON.parse(event.data);

        if (data["type"] == "VoteResponse") {
            this.receiveVoteResponse(data);
        } else if (data["type"] == "VoteRequest") {
            this.receiveVoteRequest(data);
        } else if (data["type"] == "LogRequest") {
            this.receiveLogRequest(data);
        } else if (data["type"] == "LogResponse") {
            this.receiveLogResponse(data);
        } else if (data["type"] == "StopRaft") {
            console.log("Found a room, will stop searching!")
            this.websocket.close();
            this.raftEvent.emit("stopRaft", {
                id: this.id,
                roomId: data.roomId,
                members: data.members,
                room_leader: data.room_leader
            })
        }

        this.raftEvent.emit('raft', {
            id: this.id,
            members: this.votesReceived,
            targetMember: this.targetMember,
            raftStatus: this.currentRole
        });
    }

    start(): WebSocket {
        this.websocket.onmessage = (event) => this.listeningProcedure(event);
        this.websocket.onopen = (event) => this.timeoutHandler();
        return this.websocket;
    }
}