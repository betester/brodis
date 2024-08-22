import { Raft } from "@/service";
import { createSearch, getJoinedRoom } from "@/service/matchmaking";
import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "./authContext";
import { EventEmitter } from "events";
import { useToast } from "@chakra-ui/react";

interface IMatchmakingContext {
  rooms: any[];
  startSearch: (targetMember: number) => Promise<void>;
  stopSearch: () => void;
  searching: boolean;
}

export const MatchmakingContext = createContext<IMatchmakingContext>({
  rooms: [],
  stopSearch: () => {},
  startSearch: async () => {},
  searching: false,
});

export const MatchmakingProvider: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  const [websocket, setWebsocket] = useState<WebSocket | null>();
  const [searching, setSearching] = useState<boolean>(false);
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState<any[]>([]);
  const [raftEvent, setEventEmitter] = useState<EventEmitter | null>();
  const toast = useToast();

  useEffect(() => {
    // Listen for the event
    const newEventEmitter = new EventEmitter();

    const getRooms = async () => {
      setRooms((await getJoinedRoom())!);
    };

    newEventEmitter.on("stopRaft", (data: any) => {
      setRooms((prevRooms) => {
        return [...prevRooms, data];
      });

      toast({
        position: "top-right",
        title: "Room found!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    });

    getRooms();
    setEventEmitter(newEventEmitter);
    // Clean up event listener
  }, []);

  const startSearch = async (targetMember: number) => {
    const search = (await createSearch(user?.email!, targetMember))!;
    const raft = new Raft(search, 4, 2, raftEvent!);
    const raftWebsocket = raft.start();
    raftWebsocket.onclose = () => setSearching(false);
    setSearching(true);
    setWebsocket(raftWebsocket);
  };

  const stopSearch = () => {
    if (websocket) {
      websocket.close();
      setWebsocket(null);
    }
  };

  return (
    <MatchmakingContext.Provider
      value={{
        startSearch: startSearch,
        stopSearch: stopSearch,
        rooms: rooms,
        searching: searching,
      }}
    >
      {children}
    </MatchmakingContext.Provider>
  );
};
