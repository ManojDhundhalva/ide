import { redisSetGetAll } from "./redisService.js";
import { api } from "../config/api.js";

export const saveExpandDirectoriesToDB = async (projectId, cookieHeader = "") => {
    const expandedDirectories = await redisSetGetAll("file-explorer");

    try {
        await api.put(`/project/metadata/${projectId}`, { expandedDirectories }, { headers: { Cookie: cookieHeader } });
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || "Failed to save expanded directories to DB";
        console.error("Error while saving expanded folders:", errorMsg);
    }
};

export const getExpandDirectories = async (projectId, cookieHeader = "") => {
    try {
        const { data } = await api.get(`/project/metadata/${projectId}`, { headers: { Cookie: cookieHeader } });
        return data.expandedDirectories;
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || "Failed to save expanded directories to DB";
        console.error("Error while getting expanded folders:", errorMsg);
        return null;
    }
};