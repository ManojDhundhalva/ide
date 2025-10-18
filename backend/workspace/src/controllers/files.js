import path from "path";
import fs from "fs/promises";
import config from "../config/index.js";

export const getFiles = async (req, res) => {
    const requested = req.query.path || "";
    const targetPath = path.join(config.BASE_DIR, requested);

    try {
        await fs.access(targetPath);
    } catch (err) {
        return res.status(404).json({ message: "Path not found", path: requested });
    }

    try {
        const stats = await fs.stat(targetPath);
        if (!stats.isDirectory()) {
            return res.status(400).json({ message: "Requested path must start with a directory", path: requested });
        }
    } catch (err) {
        return res.status(500).json({ message: "Failed to access path" });
    }

    try {
        const dirents = await fs.readdir(targetPath, { withFileTypes: true });

        const entries = dirents.map((d) => {
            let type = "other";
            if (d.isDirectory()) type = "directory";
            else if (d.isFile()) type = "file";
            else if (d.isSymbolicLink()) type = "symbolicLink";

            return { name: d.name, type };
        });
        
        return res.status(200).json({ message: "Directory listing retrieved", path: requested, entries });

    } catch (err) {
        return res.status(500).json({ message: "Failed to read path", path: requested });
    }
};

export const getFileContent = async (req, res) => {
    const requested = req.query.path || ".";
    const targetPath = path.join(config.BASE_DIR, requested);

    try {
        await fs.access(targetPath);
    } catch (err) {
        return res.status(404).json({ message: "Path not found", path: requested });
    }

    try {
        const stats = await fs.stat(targetPath);
        if (!stats.isFile()) {
            return res.status(400).json({ message: "Requested path is not a file", path: requested });
        }
    } catch (err) {
        return res.status(500).json({ message: "Failed to access path", path: requested });
    }

    try {
        const content = await fs.readFile(targetPath, "utf-8");
        return res.status(200).json({ path: requested, content });
    } catch (err) {
        return res.status(500).json({ message: "Failed to read file", path: requested });
    }
};



/*

Note: here i implemented only plain text files retrival, then try media also. 

*/