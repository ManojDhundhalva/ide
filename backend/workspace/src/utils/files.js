import fs from "fs/promises";
import path from "path";
import config from "../config/index.js";
import { getExpandDirectories } from "../services/fileServices.js";

export const getDirectoryEntries = async (requested = "") => {
    const targetPath = path.join(config.BASE_DIR, requested);

    const isExist = await isPathExists(targetPath); 
    if (!isExist) return null; 

    const dirents = await fs.readdir(targetPath, { withFileTypes: true });

    const entries = dirents
        ?.map((d) => {
            let type = "other";
            if (d.isDirectory()) type = "directory";
            else if (d.isFile()) type = "file";
            else if (d.isSymbolicLink()) type = "symbolicLink";

            return { name: d.name, type };
        })
        ?.sort((a, b) => {
            // Step 1: Directories first
            if (a.type === "directory" && b.type !== "directory") return -1;
            if (a.type !== "directory" && b.type === "directory") return 1;

            // Step 2: Sort alphabetically (case-insensitive)
            return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        });

    return entries;
};

export const isPathExists = async (path = "") => {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
};

export const handleRefreshFileExplorer = async () => {
    const expandedDirectories = await getExpandDirectories();

    const init = await Promise.all(
        expandedDirectories?.map(async (dirPath) => {
            const entries = await getDirectoryEntries(dirPath);
            if(!entries) return null;
            return { path: dirPath, entries };
        })
    );

    const filtered = init.filter(Boolean);

    const entries = await getDirectoryEntries();

    filtered.push({ path: "", entries });

    return filtered;
};