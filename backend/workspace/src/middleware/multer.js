import multer from "multer";
import config from "../config/index.js";
import path from "path";
import fs from "fs/promises";

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const targetPath = req.body.path; // path is projectName/targetPath
      const fullDestPath = path.join(config.BASE_PATH, targetPath);

      await fs.mkdir(fullDestPath, { recursive: true });

      cb(null, fullDestPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: async (req, file, cb) => {
    const targetPath = req.body.path; // path is projectName/targetPath
    const uploadPath = path.join(config.BASE_PATH, targetPath);

    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);

    let finalName = file.originalname;
    let counter = 1;

    while (true) {
      try {
        await fs.access(path.join(uploadPath, finalName));
        finalName = `${name}(${counter})${ext}`;
        counter++;
      } catch {
        break;
      }
    }

    cb(null, finalName);
  }
});

export const upload = multer({ storage: storage });