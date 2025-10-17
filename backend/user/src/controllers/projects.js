import { 
    getAllProjectsByUserId, 
    createNewProject, 
    addProjectToUser, 
    isAlreadyExistsProject, 
    updateProjectDetails, 
    deletedProjectByProjectId, 
    syncUserForProjectDelete 
} from "../services/projectService.js";
import { redisGet, redisSet, redisDel } from "../services/redisService.js";

export const getAllProjectsOfUser = async (req, res) => {
    try {
        const { _id: userId } = req.identity;

        let projects = await redisGet(`projects:${userId}`);

        if(!projects) {
            projects = await getAllProjectsByUserId(userId);
            await redisSet(`projects:${userId}`, projects, 5 * 60); // for 5 minutes
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

    await redisDel(`projects:${userId}`);

    try {
        const project = await createNewProject({ projectName, description, userId });
        await addProjectToUser(userId, project._id);
        return res.status(201).json({ message: "Project created successfully", project });
    } catch (error) {
        return res.status(500).json({ message: "Failed to create project. Please try again." });
    }
};

export const updateProject = async (req, res) => {
    const { _id: userId } = req.identity;
    const { id: projectId } = req.params;
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

    await redisDel(`projects:${userId}`);

    try {
        const project = await updateProjectDetails(projectId, projectName, description);
        return res.status(200).json({ message: "Project details updated successfully", project });
    } catch (error) {
        console.error("Failed to update project details:", error);
        return res.status(500).json({ message: "Failed to update project details. Please try again." });
    }
};

export const deleteProject = async (req, res) => {
    const { id: projectId } = req.params;
    const { _id: userId } = req.identity;

    try {
        await deletedProjectByProjectId(projectId);
    } catch (error) {
        console.error("Failed to delete project:", error);
        return res.status(500).json({ message: "Failed to delete project. Please try again." });
    }

    await redisDel(`projects:${userId}`);

    try {
        await syncUserForProjectDelete(userId, projectId);
        return res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Failed to sync user for project deletion:", error);
        return res.status(500).json({ message: "Failed to delete project. Please try again." });
    }
};