import fs from "fs/promises";
import fssync from "fs";  
import path from "path";
import archiver from "archiver";
import unzipper from "unzipper";
import config, { status } from "../config/index.js";
import { redisGet, redisSet, redisSetGetAll } from "../services/redisService.js";
import { downloadFileFromS3, putFileOnS3 } from "../services/awsService.js";

export const getDirectoryEntries = async (requested = null) => {
    const targetPath = await getFullPath(requested);

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

export const getFullPath = async (requested = null) => {
    const baseDir = await redisGet("project:base-dir");
    if(!requested) return baseDir;
    const targetPath = path.join(baseDir, requested);
    return targetPath;
};

export const createFolderToBaseDir = async (projectName) => {
    const targetPath = path.join(config.BASE_PATH, projectName);
    await redisSet("project:base-dir", targetPath);
    await fs.mkdir(targetPath, { recursive: true });
}

export const handleRefreshFileExplorer = async () => {
    const expandedDirectories = await redisSetGetAll("file-explorer-expanded");

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

export const createZip = async (sourcePath, destinationPath) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(sourcePath)) {
            return reject(new Error(`Source path does not exist: ${sourcePath}`));
        }

        const output = fs.createWriteStream(destinationPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            console.log(`✅ Zip created: ${archive.pointer()} bytes`);
            resolve(destinationPath);
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') {
                console.warn('Warning:', err);
            } else {
                reject(err);
            }
        });

        archive.pipe(output);

        const stat = fs.statSync(sourcePath);
        if (stat.isDirectory()) {
            const folderName = path.basename(sourcePath);
            archive.directory(sourcePath, folderName);
        } else {
            archive.file(sourcePath, { name: path.basename(sourcePath) });
        }

        archive.finalize();
    });
}

export const unzipFile = async (sourceZipPath, destinationPath) => {
    return new Promise((resolve, reject) => {
        if (!fssync.existsSync(sourceZipPath)) {
            return reject(new Error(`Source zip does not exist: ${sourceZipPath}`));
        }

        fssync.createReadStream(sourceZipPath)
            .pipe(unzipper.Extract({ path: destinationPath }))
            .on("close", () => {
                console.log(`✅ Unzipped to: ${destinationPath}`);
                resolve(destinationPath);
            })
            .on("error", reject)
            .on("warn", (err) => {
                if (err.code === "ENOENT") console.warn("Warning:", err);
                else reject(err);
            });
    });
};

export const initializeWorkingDirectory = async () => {
    try {
        const tmpFileName = `tmp_${Date.now()}`;
        const tmpFilePath = path.join(config.BASE_PATH, tmpFileName);
        
        await downloadFileFromS3(tmpFilePath);
        
        const baseDir = await redisGet("project:base-dir");
        
        await unzipFile(tmpFilePath, baseDir);
        
        await fs.unlink(tmpFilePath);
    } catch (error) {
        console.error(status.ERROR, "InitializeWorkingDirectory:", error.message);
    }
};

export const saveWorkingDirectoryToCloud = async () => {
    try {
        const tmpFileName = `tmp_${Date.now()}`;
        const tmpFilePath = path.join(config.BASE_PATH, tmpFileName);

        const baseDir = await redisGet("project:base-dir");

        await createZip(baseDir, tmpFilePath);

        await putFileOnS3(tmpFilePath);
    } catch (error) {
        console.error(status.ERROR, "SaveWorkingDirectoryToCloud:", error.message);
    }
};