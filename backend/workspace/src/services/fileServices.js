import { redisGet, redisSetGetAll, redisSetExistsByName, redisSetAddAll } from "./redisService.js";
import { api } from "../config/api.js";

export const saveExpandDirectoriesToDB = async () => {
    try {
        const expandedDirectories = await redisSetGetAll("file-explorer-expanded");
        const cookie = await redisGet("user:cookie");
        const projectId = await redisGet("user:projectId");

        if (!projectId) {
            throw new Error("saveExpandDirectoriesToDB: missing projectId — skipping save");
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

export const getExpandDirectories = async () => {
    try {    
        const isFileExplorerSetExist = await redisSetExistsByName("file-explorer-expanded");
        const cookie = await redisGet("user:cookie");
        const projectId = await redisGet("user:projectId");

        if (!projectId) {
            throw new Error("getExpandDirectories: missing projectId — skipping save");
        }

        if (!cookie) {
            console.error("getExpandDirectories: missing cookie — skipping save");
            return;
        }

        if(!isFileExplorerSetExist) {

            const { data } = await api.get(`/project/metadata/${projectId}`, { headers: { Cookie: cookie } });

            await redisSetAddAll("file-explorer-expanded", data.expandedDirectories);
            
            return data.expandedDirectories;
        }

        const expandedDirectories = await redisSetGetAll("file-explorer-expanded");
        return expandedDirectories;
        
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || "Failed to save expanded directories to DB";
        console.error("Error while getting expanded folders:", errorMsg);
        return []; 
    }
};