import { ProjectModel } from "../models/projects.js";
import { UserModel } from "../models/users.js";

export const getProjectByProjectId = (projectId) => ProjectModel.findById(projectId);

export const getUserIdByProjectId = (projectId) => ProjectModel.findById(projectId, { userId: 1, _id: 0 });

export const getAllProjectsByUserId = (userId) => ProjectModel.find({ userId }).sort({ updatedAt: -1 });

export const createNewProject = (values) => new ProjectModel(values).save().then((project) => project.toObject());

export const isAlreadyExistsProject = async (userId, projectName) => {
  const exists = await ProjectModel.exists({ userId, projectName });
  return !!exists;
};

export const addProjectToUser = (userId, projectId) => UserModel.findByIdAndUpdate(userId, { $push: { projects: projectId } });

export const updateProjectDetails = (projectId, projectName, description) => ProjectModel.findByIdAndUpdate(projectId, { $set: { projectName, description } }, { runValidators: true });

export const deletedProjectByProjectId = (projectId) => ProjectModel.findByIdAndDelete(projectId);

export const syncUserForProjectDelete = (userId, projectId) => UserModel.findByIdAndUpdate(userId, { $pull: { projects: projectId } });