import { create } from "zustand";
import { apiWS } from "../config/api";

export const useFileStore = create((set) => ({ 

    fileTree: new Map(),
    
    getFilesLoading: false,
    getFilesError: null,

    getFileContentLoading: false,
    getFileContentError: null,

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
            console.error("getFiles Error:", errorMsg);
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
            console.error("getFileContent Error:", errorMsg);
            return null;
        }  finally {
            set({ getFileContentLoading: false });
        }
    },

}));
