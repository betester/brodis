import { baseWsUrl } from "@/pages/api/hello";
import {
  Card,
  CardFooter,
  CardHeader,
  Button,
  Flex,
  Tag,
  Text,
} from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";

interface SearchCardProps {
  targetMember: number;
  cancelSearch: () => any;
  location: string;
}

export const SearchCard: FC<SearchCardProps> = ({
  targetMember,
  cancelSearch,
  location,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [currentlySearching, setCurrentlySearching] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);

    const websocket = new WebSocket(`${baseWsUrl}/matchmaking/search`);
    websocket.onmessage = (data: any) => {

      setCurrentlySearching(JSON.parse(data.data).current_searching);
    };

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return (
    <Card p="1em">
      <CardHeader>
        <Flex alignItems={"center"} justifyContent={"space-between"}>
          <Tag fontSize={"md"} p="0.4em" colorScheme="teal">
            Server : {location}
          </Tag>
          <Text fontWeight={"bold"}>
            {minutes}:{remainingSeconds}
          </Text>
        </Flex>
        <Tag mt="1em" fontSize={"md"} p="0.4em" colorScheme="orange">
          Maximum member : {targetMember}
        </Tag>
        <Tag mt="1em" fontSize={"md"} p="0.4em" colorScheme="pink">
          Active searching : {currentlySearching}
        </Tag>
      </CardHeader>
      <CardFooter width={"100%"}>
        <Button onClick={cancelSearch} colorScheme="red">
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
};
