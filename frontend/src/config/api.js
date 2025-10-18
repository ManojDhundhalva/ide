import axios from "axios";
import config from "./index";

export const api = axios.create({
  baseURL: config.BACKEND_API,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const apiWS = axios.create({
  baseURL: config.WORKSPACE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});