import { getObjectUrl, putObjectUrl } from "../controllers/aws.js";
import { isAuthenticated, isOwner } from "../middleware/index.js";

export default (router) => {
    router.get("/aws/:projectId", isAuthenticated, isOwner, getObjectUrl);
    router.put("/aws/:projectId", isAuthenticated, isOwner, putObjectUrl);
}