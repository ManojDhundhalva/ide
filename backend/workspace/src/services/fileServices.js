import { api } from "../config/api.js";
import cache from "../utils/cache.js";

export const saveMetadata = async () => {
    try {
        const sessionToken = cache.get("user:sessionToken");
        const projectId = cache.get("user:project:projectId");

        if (!projectId) {
            console.error("saveMetadata: missing projectId — skipping save");
            return;
        }

        if (!sessionToken) {
            console.error("saveMetadata: missing sessionToken — skipping save");
            return;
        }

        const expandedDirectories = cache.getAllEntriesInSet("file-explorer-expanded");
        const tabList = cache.getAllEntriesInSet("user:project:tabList");
        const activeTab = cache.get("user:project:activeTab");

        await api.put(`/project/metadata/${projectId}`, { expandedDirectories, tabs: { tabList, activeTab } }, { headers: { "X-SESSION-TOKEN": sessionToken } });
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || "Failed to save metadata to DB";
        console.error("Error while saving metadata:", errorMsg);
    }
};