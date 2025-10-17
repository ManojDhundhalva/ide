import axios from "axios";
import config from "./index";

const api = axios.create({
  baseURL: config.BACKEND_API,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default api;
