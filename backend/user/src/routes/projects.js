import { getProject, createProject, getAllProjectsOfUser, deleteProject, updateMetadata } from "../controllers/projects.js";
import { isAuthenticated, isOwner } from "../middleware/index.js";

export default (router) => {
    router.post  ("/project",                     isAuthenticated, createProject);
    router.get   ("/project",                     isAuthenticated, getAllProjectsOfUser);
    router.get   ("/project/:projectId",          isAuthenticated, isOwner, getProject);
    router.delete("/project/:projectId",          isAuthenticated, isOwner, deleteProject);
    router.put   ("/project/metadata/:projectId", isAuthenticated, isOwner, updateMetadata);
}