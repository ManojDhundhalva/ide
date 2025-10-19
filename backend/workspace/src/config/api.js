import axios from "axios";
import config from "./index.js";

export const api = axios.create({
    baseURL: config.BACKEND_API,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});