import { getFiles, getFileContent, saveFileContent, initFiles, uploadFiles } from "../controllers/files.js";
import { upload } from "../middleware/multer.js";

export default (router) => {
    router.get("/files/init", initFiles);
    router.get("/files", getFiles);
    router.get("/file", getFileContent);
    router.put("/file", saveFileContent);
    router.post("/upload", upload.array("files"), uploadFiles)
};
