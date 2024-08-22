import { RaftStatus } from "@/models";

export const steps = [
  { title: "Follower", description: "Following a room leader" },
  { title: "Candidate", description: "Electing to become leader" },
  { title: "Leader", description: "Room leader" },
];

export const fromRaftStatusToIndex = (raftStatus: RaftStatus) => {
  switch (raftStatus) {
    case RaftStatus.FOLLOWER:
      return 1;
    case RaftStatus.CANDIDATE:
      return 2;
    case RaftStatus.LEADER:
      return 3;
  }
}