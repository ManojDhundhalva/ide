import { getUser } from "../controllers/users.js";
import { isAuthenticated } from "../middleware/index.js";

export default (router) => {
    router.get("/user", isAuthenticated, getUser);
}