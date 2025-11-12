import express from "express";

import authentication from "./authentication.js";
import users from "./users.js";
import projects from "./projects.js";
import aws from "./aws.js";

const router = express.Router();

export default () => {
    authentication(router);
    users(router);
    projects(router);
    aws(router);
    return router;
};
