import { create } from "zustand";
import api from "../config/api";

export const useProjectStore = create((set) => ({ 
    
    projects: [],
    
    getAllProjectsLoading: false,
    getAllProjectsError: null,

    createProjectLoading: false,
    createProjectError: null,

    updateProjectLoading: false,
    updateProjectError: null,

    deleteProjectLoading: false,
    deleteProjectError: null,

    getAllProjects: async () => {
        try {
            set({ getAllProjectsLoading: true, getAllProjectsError: null });

            const { data } = await api.get("/project");

            set({ projects: data.projects });

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to fetch projects";
            set({ getAllProjectsError: errorMsg });
            console.error("GetAllProjects Error:", errorMsg);
            return [];
        } finally {
            set({ getAllProjectsLoading: false });
        }
    },

    createProject: async (content) => {
        try {
            set({ createProjectLoading: true, createProjectError: null });

            const { data } = await api.post("/project", content);

            set((state) => ({ projects: [...state.projects, data.project] }));

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to create project";
            set({ createProjectError: errorMsg });
            console.error("CreateProject Error:", errorMsg);
        } finally {
            set({ createProjectLoading: false });
        }
    },

    updateProject: async (projectId, content) => {
        try {
            set({ updateProjectLoading: true, updateProjectError: null });

            await api.put(`/project/${projectId}`, content);

            set((state) => ({
                projects: state.projects.map((p) =>
                    p.id === projectId ? data.project : p
                ),
            }));

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to update project";
            set({ updateProjectError: errorMsg });
            console.error("UpdateProject Error:", errorMsg);
        } finally {
            set({ updateProjectLoading: false });
        }
    },

    deleteProject: async (projectId) => {
        try {
            set({ deleteProjectLoading: true, deleteProjectError: null });

            await api.delete(`/project/${projectId}`);

            set((state) => ({
                projects: state.projects.filter((p) => p.id !== projectId),
            }));

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to delete project";
            set({ deleteProjectError: errorMsg });
            console.error("DeleteProject Error:", errorMsg);
        } finally {
            set({ deleteProjectLoading: false });
        }
    },
}));
