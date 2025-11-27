import axios from "axios";
import config from "./index.js";
import cache from "../utils/cache.js";

export const api = axios.create({
    baseURL: config.BACKEND_API,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
    const sessionToken = cache.get("user:sessionToken");
    if (sessionToken) config.headers["X-SESSION-TOKEN"] = sessionToken;  
    return config;
}, (error) => {
    return Promise.reject(error);
});