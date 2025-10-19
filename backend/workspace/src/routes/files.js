import { getFiles, getFileContent, saveFileContent } from "../controllers/files.js";

export default (router) => {
    router.get("/files", getFiles);
    router.get("/file", getFileContent);
    router.put("/file", saveFileContent);
};
