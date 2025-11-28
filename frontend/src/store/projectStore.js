import { create } from "zustand";
import { api } from "../config/api";

export const useProjectStore = create((set) => ({ 

    projects: [],

    project: null,

    getProjectLoading: false,
    getProjectError: null,
    
    getAllProjectsLoading: false,
    getAllProjectsError: null,

    createProjectLoading: false,
    createProjectError: null,

    deleteProjectLoading: false,
    deleteProjectError: null,

    getProjectStatusLoading: false,
    getProjectStatusError: null,

    getProject: async (projectId) => {
        try {
            set({ project: null, getProjectLoading: true, getProjectError: null });

            const { data } = await api.get(`/project/${projectId}`);

            set({ project: data.project });

            return { project: data.project, ec2_ip: data.ec2_ip };

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || `Failed to fetch project of id: ${projectId}`;
            set({ getProjectError: errorMsg });
            console.error("getProject Error:", errorMsg);
            return null;
        } finally {
            set({ getProjectLoading: false });
        }
    },

    getAllProjects: async () => {
        try {
            set({ project: null, getAllProjectsLoading: true, getAllProjectsError: null });

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
            set({ project: null, createProjectLoading: true, createProjectError: null });

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

    deleteProject: async (projectId) => {
        try {
            set({ project: null, deleteProjectLoading: true, deleteProjectError: null });

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

    getProjectStatus: async (projectId) => {
        try {
            set({ getProjectStatusLoading: true, getProjectStatusError: null });

            const { data } = await api.get(`/project/status/${projectId}`);

            return data.status;

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to get project status";
            set({ getProjectStatus: errorMsg });
            console.error("GetProjectStatus Error:", errorMsg);
        } finally {
            set({ getProjectStatusLoading: false });
        }
    },
}));
