import { getProject, createProject, getAllProjectsOfUser, deleteProject, updateMetadata, startEC2, stopEC2, getProjectStatus } from "../controllers/projects.js";
import { isAuthenticated, isOwner } from "../middleware/index.js";

export default (router) => {
    router.post  ("/project",                     isAuthenticated, createProject);
    router.get   ("/project",                     isAuthenticated, getAllProjectsOfUser);
    router.get   ("/project/:projectId",          isAuthenticated, isOwner, getProject);
    router.delete("/project/:projectId",          isAuthenticated, isOwner, deleteProject);
    router.put   ("/project/metadata/:projectId", isAuthenticated, isOwner, updateMetadata);
    router.post  ("/project/start/:projectId",    isAuthenticated, isOwner, startEC2);
    router.post  ("/project/stop/:projectId",     isAuthenticated, isOwner, stopEC2);
    router.get   ("/project/status/:projectId",   isAuthenticated, isOwner, getProjectStatus);
}