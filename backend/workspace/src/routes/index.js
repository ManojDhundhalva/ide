import express from "express";

import files from "./files.js";

const router = express.Router();

export default () => {
    files(router);
    return router;
};
