import { api } from "../config/api.js";
import { createFolderToBaseDir } from "../utils/files.js";
import cache from "../utils/cache.js";

export const getProject = async (projectId) => {
    try {
        const sessionToken = cache.get("user:sessionToken");
        const { data } = await api.get(`/project/${projectId}`, { headers: { "X-SESSION-TOKEN": sessionToken } });

        cache.set("user:project:userId", data.project.userId);
        cache.set("user:project:projectId", data.project._id);
        cache.set("user:project:projectName", data.project.projectName);
        cache.set("user:project:description", data.project.description);
        cache.set("user:project:activeTab", data.project.metadata.tabs.activeTab);
        cache.addEntriesInSet("user:project:tabList", data.project.metadata.tabs.tabList);
        cache.addEntriesInSet("file-explorer-expanded", data.project.metadata.expandedDirectories);
        // cache.set("user:project:updatedAt", data.project.updatedAt);
        // cache.set("user:project:createdAt", data.project.createdAt);

        await createFolderToBaseDir(data.project.projectName);
        
        return true;
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || `Failed to fetch project of id: ${projectId}`;
        console.error("getProject Error:", errorMsg);
        return false;
    }
}

export const stopEC2 = async (projectId) => {
    try {
        const sessionToken = cache.get("user:sessionToken");
        await api.get(`/project/stop/${projectId}`, { headers: { "X-SESSION-TOKEN": sessionToken } });
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || "Failed to stop ec2 instance";
        console.error("stopEC2 Error:", errorMsg);
    }
};