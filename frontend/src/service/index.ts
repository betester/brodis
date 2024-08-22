import { baseHttpUrl } from "@/pages/api/hello";
import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: baseHttpUrl!
})

export * from './raft';
export * from './auth';
export * from './matchmaking';

