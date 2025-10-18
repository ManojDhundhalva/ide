import { getFiles, getFileContent } from "../controllers/files.js";

export default (router) => {
    router.get("/files", getFiles);
    router.get("/file", getFileContent);
};
