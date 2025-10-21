import { getProject, createProject, getAllProjectsOfUser, updateProject, deleteProject, getExpandedDirectories, updateExpandedDirectories } from "../controllers/projects.js";
import { isAuthenticated, isOwner } from "../middleware/index.js";

export default (router) => {
    router.get("/project/:projectId", isAuthenticated, isOwner, getProject);
    router.post("/project", isAuthenticated, createProject);
    router.get("/project", isAuthenticated, getAllProjectsOfUser);
    router.put("/project/:projectId", isAuthenticated, isOwner, updateProject);
    router.delete("/project/:projectId", isAuthenticated, isOwner, deleteProject);
    router.get("/project/metadata/:projectId", isAuthenticated, isOwner, getExpandedDirectories);
    router.put("/project/metadata/:projectId", isAuthenticated, isOwner, updateExpandedDirectories);
}