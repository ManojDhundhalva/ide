import { 
    getProjectByProjectId,
    getAllProjectsByUserId, 
    createNewProject, 
    addProjectToUser, 
    isAlreadyExistsProject, 
    deletedProjectByProjectId, 
    syncUserForProjectDelete,
    updateMetadataOfProject,
    getInstanceIdByProjectId,
} from "../services/projectService.js";

import { createInstance, startInstance, stopInstance, getPublicIP, getPublicDNS, deleteInstance, getInstanceStatus } from "../utils/aws.js";

import cache from "../utils/cache.js";

export const getProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await getProjectByProjectId(projectId);

        // const ip = await getPublicIP(project.instanceId);

        const public_dns = await getPublicDNS(project.instanceId);

        delete project.instanceId;

        return res.status(200).json({ message: "Project fetched successfully", project, ec2_ip: `ws://${public_dns}` });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return res.status(500).json({ message: "Failed to fetch projects" });
    }
};

export const getAllProjectsOfUser = async (req, res) => {
    try {
        const { _id: userId } = req.identity;

        let projects = cache.get(`projects:${userId}`);

        if(!projects) {
            projects = await getAllProjectsByUserId(userId);
            cache.set(`projects:${userId}`, projects);
        }

        return res.status(200).json({ message: "Projects fetched successfully", projects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return res.status(500).json({ message: "Failed to fetch projects" });
    }
};

export const createProject = async (req, res) => {
    const { _id: userId } = req.identity;
    const { projectName, description } = req.body;

    if (!projectName) {
        return res.status(400).json({ message: "Project name is required" });
    }

    try {
        const existing = await isAlreadyExistsProject(userId, projectName);
        if (existing) {
            return res.status(409).json({ message: "A project with this name already exists for this user." });
        }
    } catch (error) {
        console.error("Error checking existing project:", error);
        return res.status(500).json({ message: "Failed to check project existence" });   
    }

    cache.delete(`projects:${userId}`);

    try {
        const instanceId = await createInstance(`${Date.now()}-${projectName}`);
        
        const project = await createNewProject({ projectName, description, userId, instanceId });

        await addProjectToUser(userId, project._id);

        return res.status(201).json({ message: "Project created successfully", project });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to create project. Please try again."});
    }
};

export const deleteProject = async (req, res) => {
    const { projectId } = req.params;
    const { _id: userId } = req.identity;

    try {
        await deletedProjectByProjectId(projectId);
    } catch (error) {
        console.error("Failed to delete project:", error);
        return res.status(500).json({ message: "Failed to delete project. Please try again." });
    }

    cache.delete(`projects:${userId}`);

    try {
        let instanceId = cache.get(`project:ec2-instance-id:${projectId}`);

        if(!instanceId) {
            instanceId = await getInstanceIdByProjectId(projectId);
        }
        
        await deleteInstance(instanceId);

        cache.delete(`project:ec2-instance-id:${projectId}`);
        
        await syncUserForProjectDelete(userId, projectId);

        return res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Failed to sync user for project deletion:", error);
        return res.status(500).json({ message: "Failed to delete project. Please try again." });
    }
};

export const updateMetadata = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { expandedDirectories, tabs } = req.body;

        if(!expandedDirectories || !tabs || !tabs.tabList) {
            return res.status(400).json({ message: "expandedDirectories, tabs.tabList are required." });
        }

        if (expandedDirectories && !Array.isArray(expandedDirectories)) {
            return res.status(400).json({ message: "expandedDirectories must be an array." });
        }

        if (tabs && tabs?.tabList && !Array.isArray(tabs.tabList)) {
            return res.status(400).json({ message: "tabList must be an array." });
        }

        const updatedProject = await updateMetadataOfProject(projectId, expandedDirectories, tabs);

        if (!updatedProject) {
            return res.status(404).json({ message: `Project not found: Invalid projectId: ${projectId}` });
        }

        return res.status(200).json({ message: "Metadata updated successfully" });
    } catch (error) {
        console.error("Error updating metadata:", error);
        return res.status(500).json({ message: "Failed to update metadata" });
    }
};

export const startEC2 = async (req, res) => {
    try {
        const { projectId } = req.params;

        let instanceId = cache.get(`project:ec2-instance-id:${projectId}`);

        if(!instanceId) {
            instanceId = await getInstanceIdByProjectId(projectId);
            cache.set(`project:ec2-instance-id:${projectId}`, instanceId);
        }

        await startInstance(instanceId);
        
        return res.status(200).json({ message: "Instance started successfully" });
    } catch (error) {
        console.error("Error statring ec2 instance:", error);
        return res.status(500).json({ message: "Failed to start ec2 instance" });
    }
};

export const stopEC2 = async (req, res) => {
    try {
        const { projectId } = req.params;

        let instanceId = cache.get(`project:ec2-instance-id:${projectId}`);

        if(!instanceId) {
            instanceId = await getInstanceIdByProjectId(projectId);
            cache.set(`project:ec2-instance-id:${projectId}`, instanceId);
        }

        await stopInstance(instanceId);
        
        return res.status(200).json({ message: "Instance stopped successfully" });
    } catch (error) {
        console.error("Error statring ec2 instance:", error);
        return res.status(500).json({ message: "Failed to stop ec2 instance" });
    }
};

export const getProjectStatus = async (req, res) => {
    try {
        const { projectId } = req.params;

        let instanceId = cache.get(`project:ec2-instance-id:${projectId}`);

        if(!instanceId) {
            instanceId = await getInstanceIdByProjectId(projectId);
            cache.set(`project:ec2-instance-id:${projectId}`, instanceId);
        }

        const projectStatus = await getInstanceStatus(instanceId);
        
        return res.status(200).json({ message: "Instance stopped successfully", projectStatus });
    } catch (error) {
        console.error("Error statring ec2 instance:", error);
        return res.status(500).json({ message: "Failed to stop ec2 instance" });
    }
};