import { create } from "zustand";
import { api, apiWS } from "../config/api";

export const useFileStore = create((set, get) => ({

    tabs: [],

    currentFilePath: null,

    setCurrentFilePath: (path = null) => {
        set(() => ({ currentFilePath: path }));
    },

    fileTree: new Map(),

    initFilesLoading: false,
    initFilesError: null,
    
    getFilesLoading: false,
    getFilesError: null,

    getFileContentLoading: false,
    getFileContentError: null,

    saveFileContentToDBLoading: false,
    saveFileContentToDBError: null,

    getExpandedDirectoriesLoading: false,
    getExpandedDirectoriesError: null,

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

            const { data } = await apiWS.get("/files/init");

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
            set({ getFilesLoading: true, getFilesError: null });

            const { data } = await apiWS.get(`/files?path=${path}`);

            set((state) => {
                const newFileTree = new Map(state.fileTree);
                newFileTree.set(path, data.entries);
                return { fileTree: newFileTree };
            });

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to fetch files and/or directories";
            set({ getFilesError: errorMsg });
            console.error("FetFiles Error:", errorMsg);
        }  finally {
            set({ getFilesLoading: false });
        }
    },

    getFileContent: async (path) => {
        try {
            set({ getFileContentLoading: true, getFileContentError: null });

            if (!path) {
                throw new Error("Path cannot be empty");
            }

            const { data } = await apiWS.get(`/file?path=${path}`);

            return data.content;

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to fetch file content";
            set({ getFileContentError: errorMsg });
            console.error("GetFileContent Error:", errorMsg);
            return "";
        }  finally {
            set({ getFileContentLoading: false });
        }
    },

    saveFileContentToDB: async (content) => {
        try {
            set({ saveFileContentToDBLoading: true, saveFileContentToDBError: null });

            const currentFilePath = get().currentFilePath;

            if (!currentFilePath) return;

            await apiWS.put(`/file?path=${currentFilePath}`, { content });

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to save file content";
            set({ saveFileContentToDBError: errorMsg });
            console.error("SaveFileContentToDB Error:", errorMsg);
        }  finally {
            set({ saveFileContentToDBLoading: false });
        }
    },

    getExpandedDirectories: async (projectId) => {
        try {
            set({ getExpandedDirectoriesLoading: true, getExpandedDirectoriesError: null });

            const { data } = await api.get(`/project/metadata/${projectId}`);

            return data.expandedDirectories;

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || `Failed to fetch expanded directories`;
            set({ getExpandedDirectoriesError: errorMsg });
            console.error("getExpandedDirectories Error:", errorMsg);
            return null;
        } finally {
            set({ getExpandedDirectoriesLoading: false });
        }
    },

}));
