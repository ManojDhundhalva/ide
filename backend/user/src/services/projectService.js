import { ProjectModel } from "../models/projects.js";
import { UserModel } from "../models/users.js";

export const getProjectByProjectId = (projectId) => ProjectModel.findById(projectId).select('projectName description updatedAt createdAt +metadata.expandedDirectories').lean();

export const getUserIdByProjectId = (projectId) => ProjectModel.findById(projectId, { userId: 1, _id: 0 });

export const getAllProjectsByUserId = (userId) => 
    ProjectModel.find({ userId }, { 
        projectName: 1, 
        description: 1, 
        createdAt: 1, 
        updatedAt: 1 
    })
    .sort({ updatedAt: -1 })
    .lean();

export const createNewProject = (values) => 
    new ProjectModel(values)
        .save()
        .then((project) => {
            const { _id, projectName, description, createdAt, updatedAt } = project.toObject();
            return { _id, projectName, description, createdAt, updatedAt };
        });

export const isAlreadyExistsProject = async (userId, projectName) => {
  const exists = await ProjectModel.exists({ userId, projectName });
  return !!exists;
};

export const addProjectToUser = (userId, projectId) => UserModel.findByIdAndUpdate(userId, { $push: { projects: projectId } });

export const updateProjectDetails = (projectId, projectName, description) => 
    ProjectModel.findByIdAndUpdate(
        projectId, 
        { $set: { projectName, description } }, 
        { 
            new: true, 
            runValidators: true,
            projection: {
                projectName: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ).lean();
    
export const deletedProjectByProjectId = (projectId) => ProjectModel.findByIdAndDelete(projectId);

export const syncUserForProjectDelete = (userId, projectId) => UserModel.findByIdAndUpdate(userId, { $pull: { projects: projectId } });

export const getExpandedDirectoriesOfProject = (projectId) => ProjectModel.findById(projectId, { "metadata.expandedDirectories": 1 }).lean();

export const updateExpandedDirectoriesOfProject = (projectId, expandedDirectories) => ProjectModel.findByIdAndUpdate(projectId, { 'metadata.expandedDirectories': expandedDirectories }, { new: true, runValidators: true } );