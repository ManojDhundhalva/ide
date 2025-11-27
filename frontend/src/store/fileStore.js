import { create } from "zustand";
import axios from "axios";

export const useFileStore = create((set, get) => ({

    tabs: [],

    ec2_ip: null,

    activeTab: null,

    setEC2Ip: (ip) => {
        set({ ec2_ip: ip });
    },

    initTabs: (initialTabs = [], initialActiveTab = null) => {
        const tabs = initialTabs.map((item) => ({
            filePath: item,
            title: item.split("/").pop()
        }));

        set({
            tabs,
            activeTab: initialActiveTab
        });
    },

    openTab: (filePath, socket) => {
        const { tabs } = get();
    
        const existingTab = tabs.find((tab) => tab.filePath === filePath);
    
        if (existingTab) {
            socket.emit("tabs:set-active-tab", { path: existingTab.filePath });
            set({ activeTab: existingTab.filePath });
            return;
        }
    
        const newTab = {
            filePath,
            title: filePath.split('/').pop(),
        };
    
        set({ 
            tabs: [...tabs, newTab],
            activeTab: filePath
        });

        socket.emit("tabs:set-active-tab", { path: filePath });
        socket.emit("tabs:open-tab", { path: filePath });
    },  
  
    closeTab: (filePath, socket) => {
        const { tabs, activeTab, fileExistsInDirectory } = get();
        
        const newTabs = tabs.filter((tab) => tab.filePath !== filePath && fileExistsInDirectory(tab.filePath));
        
        if (activeTab === filePath) {

            const currentIndex = tabs.findIndex(tab => tab.filePath === filePath);

            if (newTabs.length > 0) {

                const nextTab = newTabs[Math.min(currentIndex, newTabs.length - 1)];
                const newActiveTab = nextTab.filePath;
                socket.emit("tabs:set-active-tab", { path: newActiveTab });

                set({ 
                    tabs: newTabs,
                    activeTab: newActiveTab
                });
            
            } else {
                set({ tabs: [], activeTab: null });
                socket.emit("tabs:set-active-tab", { path: null });
            }
        } else {
            set({ tabs: newTabs });
        }

        socket.emit("tabs:close-tab", { path: filePath });
    },

    setActiveTab: (filePath, socket) => {
        socket.emit("tabs:set-active-tab", { path: filePath });
        set({ activeTab: filePath });
    },

    // NEW: Reorder tabs function
    reorderTabs: (fromIndex, toIndex) => {
        const { tabs } = get();
        const newTabs = [...tabs];
        const [movedTab] = newTabs.splice(fromIndex, 1);
        newTabs.splice(toIndex, 0, movedTab);
        set({ tabs: newTabs });
    },

    fileTree: new Map(),

    initFilesLoading: false,
    initFilesError: null,
    
    getFilesLoading: false,
    getFilesError: null,
    getFilesDirectoryPath: null,

    getFileContentLoading: false,
    getFileContentError: null,
    getFileContentFilePath: null,

    saveFileContentToDBLoading: false,
    saveFileContentToDBError: null,

    fileExistsInDirectory: (filePath) => {
        const { fileTree } = get();

        const parts = filePath.split("/");
        const fileName = parts.pop();
        const dirPath = parts.join("/");

        if (!fileTree.has(dirPath)) return false;

        const entries = fileTree.get(dirPath);
        
        return entries.some(entry => entry.name === fileName && entry.type !== "directory");
    },

    handleRefreshFileExplorer: (data) => {
        set((state) => {
            const newFileTree = new Map(state.fileTree);
        
            data.data.forEach((data) => {
                newFileTree.set(data.path, data.entries);
            });
        
            return { fileTree: newFileTree };
        });
    },

    initFiles: async () => {
        try {
            set({ initFilesLoading: true, initFilesError: null });

            const url = `${get().ec2_ip}:9000`;

            const { data } = await axios.get(`${url}/files/init`);

            set((state) => {
                const newFileTree = new Map(state.fileTree);
            
                data?.init?.forEach((data) => {
                    newFileTree?.set(data?.path, data?.entries);
                });
            
                return { fileTree: newFileTree };
            });

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to fetch init files and directories";
            set({ initFilesError: errorMsg });
            console.error("initFiles Error:", errorMsg);
        }  finally {
            set({ initFilesLoading: false });
        }
    },

    getFiles: async (path = "") => {
        try {
            set({ getFilesLoading: true, getFilesError: null, getFilesDirectoryPath: path });

            const url = `${get().ec2_ip}:9000`;

            const { data } = await axios.get(`${url}/files?path=${path}`);

            set((state) => {
                const newFileTree = new Map(state.fileTree);
                newFileTree.set(path, data.entries);
                return { fileTree: newFileTree };
            });

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to fetch files and/or directories";
            set({ getFilesError: errorMsg, getFilesDirectoryPath: null });
            console.error("FetFiles Error:", errorMsg);
        }  finally {
            set({ getFilesLoading: false, getFilesDirectoryPath: null });
        }
    },

    getFileContent: async (path) => {
        try {
            set({ getFileContentLoading: true, getFileContentError: null, getFileContentFilePath: path });

            if (!path) {
                throw new Error("Path cannot be empty");
            }

            const url = `${get().ec2_ip}:9000`;

            const { data } = await axios.get(`${url}/file?path=${path}`);

            return data.content;

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to fetch file content";
            set({ getFileContentError: errorMsg, getFileContentFilePath: null });
            console.error("GetFileContent Error:", errorMsg);
            return "";
        }  finally {
            set({ getFileContentLoading: false, getFileContentFilePath: null });
        }
    },

    saveFileContentToDB: async (content) => {
        try {
            set({ saveFileContentToDBLoading: true, saveFileContentToDBError: null });

            const { activeTab: currentFilePath } = get();

            if (!currentFilePath) return;

            const url = `${get().ec2_ip}:9000`;

            await axios.put(`${url}/file?path=${currentFilePath}`, { content });

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to save file content";
            set({ saveFileContentToDBError: errorMsg });
            console.error("SaveFileContentToDB Error:", errorMsg);
        }  finally {
            set({ saveFileContentToDBLoading: false });
        }
    },
    
}));