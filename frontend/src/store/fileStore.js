import { create } from "zustand";
import { apiWS } from "../config/api";

export const useFileStore = create((set, get) => ({

    tabs: [],

    currentFilePath: null,

    setCurrentFilePath: (path = null) => {
        set(() => ({ currentFilePath: path }));
    },

    fileTree: new Map(),
    
    getFilesLoading: false,
    getFilesError: null,

    getFileContentLoading: false,
    getFileContentError: null,

    saveFileContentToDBLoading: false,
    saveFileContentToDBError: null,

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

}));
