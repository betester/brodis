import { Room, Search } from "@/models";
import { axiosInstance } from ".";

const SEARCH_URL = "/matchmaking/search"
const ROOM_URL = "/matchmaking/room"

export const createSearch = async (userId: string, targetMember: number): Promise<undefined | Search> => {
    try {
        return (await axiosInstance.post(SEARCH_URL, { userId: userId, targetMember: targetMember }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        })).data;
    }
    catch (error) {
        console.log(error)
    }
}

export const updateSearch = async (search: Search) => {
    try {
        return await axiosInstance.put(SEARCH_URL, search)
    }

    catch (error) {
        console.log(error)
    }
}

export const createRoom = async (room: Room): Promise<undefined | Room> => {
    try {
        return (await axiosInstance.post(ROOM_URL, room, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        })).data;
    }
    catch (error) {
        console.log(error)
    }
}

export const getJoinedRoom = async (): Promise<undefined | Room[]> => {
    try {
        return (await axiosInstance.get(ROOM_URL, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        })).data;
    }
    catch (error) {
        console.log(error)
    }
}

export const getLocation = async (): Promise<any> => {
    try {
        return (await axiosInstance.get("")).data["message"];
    }
    catch (error) {
        console.log(error)
    }
}