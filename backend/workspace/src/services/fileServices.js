import { redisGet, redisSetGetAll } from "./redisService.js";
import { api } from "../config/api.js";

export const saveExpandDirectoriesToDB = async () => {
    try {
        const expandedDirectories = await redisSetGetAll("file-explorer-expanded");
        const cookie = await redisGet("user:cookie");
        const { projectId } = await redisGet("user:project:projectId");

        if (!projectId) {
            console.error("saveExpandDirectoriesToDB: missing projectId — skipping save");
            return;
        }

        if (!cookie) {
            console.error("saveExpandDirectoriesToDB: missing cookie — skipping save");
            return;
        }

        await api.put(`/project/metadata/${projectId}`, { expandedDirectories }, { headers: { Cookie: cookie } });
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || "Failed to save expanded directories to DB";
        console.error("Error while saving expanded folders:", errorMsg);
    }
};