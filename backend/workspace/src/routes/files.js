import { getFiles, getFileContent, saveFileContent, initFiles } from "../controllers/files.js";

export default (router) => {
    router.get("/files/init", initFiles);
    router.get("/files", getFiles);
    router.get("/file", getFileContent);
    router.put("/file", saveFileContent);
};
