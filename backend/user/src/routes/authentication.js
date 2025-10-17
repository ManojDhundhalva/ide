import { authenticate, logout } from "../controllers/authentication.js";

export default (router) => {
    router.post("/auth", authenticate);
    router.post("/logout", logout);
};
