import { redisGet, redisSetGetAll } from "./redisService.js";
import { api } from "../config/api.js";

export const saveMetadata = async () => {
    try {
        const sessionToken = await redisGet("user:sessionToken");
        const projectId = await redisGet("user:project:projectId");

        if (!projectId) {
            console.error("saveMetadata: missing projectId — skipping save");
            return;
        }

        if (!sessionToken) {
            console.error("saveMetadata: missing sessionToken — skipping save");
            return;
        }

        const expandedDirectories = await redisSetGetAll("file-explorer-expanded");
        const tabList = await redisSetGetAll("user:project:tabList");
        const activeTab = await redisGet("user:project:activeTab");

        await api.put(`/project/metadata/${projectId}`, { expandedDirectories, tabs: { tabList, activeTab } }, { headers: { "X-SESSION-TOKEN": sessionToken } });
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || "Failed to save metadata to DB";
        console.error("Error while saving metadata:", errorMsg);
    }
};