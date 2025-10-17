import { createProject, getAllProjectsOfUser, updateProject, deleteProject } from "../controllers/projects.js";
import { isAuthenticated, isOwner } from "../middleware/index.js";

export default (router) => {
    router.post("/project", isAuthenticated, createProject);
    router.get("/project", isAuthenticated, getAllProjectsOfUser);
    router.put("/project/:id", isAuthenticated, isOwner, updateProject);
    router.delete("/project/:id", isAuthenticated, isOwner, deleteProject);
}