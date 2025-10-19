import { getProject, createProject, getAllProjectsOfUser, updateProject, deleteProject, getExpandedDirectories, updateExpandedDirectories } from "../controllers/projects.js";
import { isAuthenticated, isOwner } from "../middleware/index.js";

export default (router) => {
    router.get("/project/:id", isAuthenticated, isOwner, getProject);
    router.post("/project", isAuthenticated, createProject);
    router.get("/project", isAuthenticated, getAllProjectsOfUser);
    router.put("/project/:id", isAuthenticated, isOwner, updateProject);
    router.delete("/project/:id", isAuthenticated, isOwner, deleteProject);
    router.get("/project/metadata/:id", isAuthenticated, isOwner, getExpandedDirectories);
    router.put("/project/metadata/:id", isAuthenticated, isOwner, updateExpandedDirectories);
}