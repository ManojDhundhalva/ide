import axios from "axios";
import config from "./index.js";
import { redisGet } from "../services/redisService.js";

export const api = axios.create({
    baseURL: config.BACKEND_API,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
    const sessionToken = await redisGet("user:sessionToken");
    if (sessionToken) config.headers["X-SESSION-TOKEN"] = sessionToken;  
    return config;
}, (error) => {
    return Promise.reject(error);
});