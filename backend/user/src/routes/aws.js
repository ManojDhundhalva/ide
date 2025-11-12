import { getCreadentials } from "../controllers/aws.js";
import { isAuthenticated } from "../middleware/index.js";

export default (router) => {
    router.get("/aws", isAuthenticated, getCreadentials);
}