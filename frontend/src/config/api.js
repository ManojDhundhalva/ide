import axios from "axios";
import config from "./index";

export const api = axios.create({
  baseURL: config.BACKEND_API,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const sessionToken = window.localStorage.getItem("session-token");
  if (sessionToken) config.headers["X-SESSION-TOKEN"] = sessionToken;  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const apiWS = axios.create({
  baseURL: config.WORKSPACE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});