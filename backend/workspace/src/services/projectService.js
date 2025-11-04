import { api } from "../config/api.js";
import { redisGet, redisSet, redisSetAddAll } from "./redisService.js";
import { createFolderToBaseDir } from "../utils/files.js";

export const getProject = async (projectId) => {
    try {
        const cookie = await redisGet("user:cookie");
        const { data } = await api.get(`/project/${projectId}`, { headers: { Cookie: cookie } });

        await redisSet("user:project:userId", data.project.userId);
        await redisSet("user:project:projectId", data.project._id);
        await redisSet("user:project:projectName", data.project.projectName);
        await redisSet("user:project:description", data.project.description);
        await redisSet("user:project:activeTab", data.project.metadata.tabs.activeTab);
        await redisSetAddAll("user:project:tabList", data.project.metadata.tabs.tabList);
        await redisSetAddAll("file-explorer-expanded", data.project.metadata.expandedDirectories);
        // await redisSet("user:project:updatedAt", data.project.updatedAt);
        // await redisSet("user:project:createdAt", data.project.createdAt);

        await createFolderToBaseDir(data.project.projectName);
        
        return true;
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || `Failed to fetch project of id: ${projectId}`;
        console.error("getProject Error:", errorMsg);
        return false;
    }
}