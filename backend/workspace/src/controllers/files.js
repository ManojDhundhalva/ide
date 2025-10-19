import path from "path";
import fs from "fs/promises";
import config from "../config/index.js";
import { redisGet } from "../services/redisService.js";
import { getExpandDirectories } from "../services/fileServices.js";
import { getDirectoryEntries } from "../utils/files.js"

export const initFiles = async (req, res) => {
    try {
        const cookie = await redisGet("user:cookie");
        const projectId = await redisGet("user:projectId");

        const expandedDirectories = await getExpandDirectories(projectId, cookie);
        
        // Use Promise.all to wait for all async operations to complete
        const init = await Promise.all(
            expandedDirectories.map(async (dirPath) => {
                const entries = await getDirectoryEntries(dirPath);
                return { path: dirPath, entries };
            })
        );

        return res.status(200).json({ message: "Successfully fetched expanded directories", init }); 
    } catch (error) {
        console.error("Error in initFiles:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getFiles = async (req, res) => {
    const requested = req.query.path || "";
    const targetPath = path.join(config.BASE_DIR, requested);

    try {
        const stats = await fs.stat(targetPath);
        if (!stats.isDirectory()) {
            return res.status(400).json({ message: "Requested path must start with a directory", path: requested });
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            return res.status(404).json({ message: "Path not found", path: requested });
        }
        return res.status(500).json({ message: "Failed to access path", path: requested });
    }

    try {
        const entries = await getDirectoryEntries(requested);
        return res.status(200).json({ message: "Directory listing retrieved", path: requested, entries });

    } catch (err) {
        return res.status(500).json({ message: "Failed to read path", path: requested });
    }
};

/*

Note: here i implemented only plain text files retrival, then try media also. 

*/

export const getFileContent = async (req, res) => {
    const requested = req.query.path || ".";
    const targetPath = path.join(config.BASE_DIR, requested);

    try {
        const stats = await fs.stat(targetPath);
        if (!stats.isFile()) {
            return res.status(400).json({ message: "Requested path is not a file", path: requested });
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            return res.status(404).json({ message: "Path not found", path: requested });
        }
        return res.status(500).json({ message: "Failed to access path", path: requested });
    }

    try {
        const content = await fs.readFile(targetPath, "utf-8");
        return res.status(200).json({ path: requested, content });
    } catch (err) {
        return res.status(500).json({ message: "Failed to read file", path: requested });
    }
};


export const saveFileContent = async (req, res) => {
    const requested = req.query.path;
    const { content } = req.body;
    const targetPath = path.join(config.BASE_DIR, requested);

    console.log(requested);
    console.log(targetPath);

    if (!requested || !content) {
        return res.status(400).json({ message: "Path and content are required." });
    }

    try {
        const stats = await fs.stat(targetPath);
        if (!stats.isFile()) {
            return res.status(400).json({ message: "Requested path is not a file", path: requested });
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            return res.status(404).json({ message: "Path not found", path: requested });
        }
        return res.status(500).json({ message: "Failed to access path", path: requested });
    }

    try {
        await fs.writeFile(targetPath, content, 'utf8');
        return res.status(200).json({ message: "File saved successfully", path: requested });
    } catch (err) {
        return res.status(500).json({ message: "Failed to write file", path: requested });
    }
};