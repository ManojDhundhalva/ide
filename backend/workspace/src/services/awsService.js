import axios from "axios";
import fs from "fs";
import { api } from "../config/api.js";
import { status } from "../config/index.js";

export const getSignedObjectUrl = async () => {
    try {
        const cookie = await redisGet("user:cookie");
        const projectId = await redisGet("user:project:projectId");

        if (!projectId) {
            throw new Error("Missing projectId");
        }

        if (!cookie) {
            throw new Error("Missing cookie");
        }

        const { data } = await api.get(`/aws/${projectId}`, { headers: { Cookie: cookie } });
        const { url } = data;
        return url;
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || "Failed to fetch GetSignedObjectUrl";
        console.error(status.ERROR, "GetSignedObjectUrl:", errorMsg);
        throw new Error("Failed to fetch presigned url");
    }
};

export const putSignedObjectUrl = async () => {
    try {
        const cookie = await redisGet("user:cookie");
        const projectId = await redisGet("user:project:projectId");

        if (!projectId) {
            throw new Error("Missing projectId");
        }

        if (!cookie) {
            throw new Error("Missing cookie");
        }

        const { data } = await api.put(`/aws/${projectId}`, {}, { headers: { Cookie: cookie } });
        const { url } = data;
        return url;
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || "Failed to fetch PutSignedObjectUrl";
        console.error(status.ERROR, "PutSignedObjectUrl:", errorMsg);
        throw new Error(`Failed to download from signed url: ${error.message}`);
    }
};

export const downloadFileFromS3 = async (path) => {
    try {
        const presignedUrl = await getSignedObjectUrl();
        
        const writer = fs.createWriteStream(path);

        const response = await axios.get(presignedUrl, { responseType: "stream", timeout: 0 });
                
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", () => {
                console.log(status.SUCCESS, `File downloaded successfully: ${localFileName}`);
                resolve(localFileName);
            });
            
            writer.on('error', (error) => {
                console.error(status.ERROR, "Writing file:", err);
                fs.unlink(localFileName, () => {});
                reject(error);
            });
        });

    } catch (error) {
        console.error(status.ERROR, "DownloadFileFromS3:", error.message);
        throw new Error(`Failed to download from signed url: ${error.message}`);
    }
};

export const putFileOnS3 = async (path) => {
    try {
        const presignedUrl = await putSignedObjectUrl();

        const fileStream = fs.createReadStream(path);

        await axios.put(presignedUrl, fileStream, {
            headers: {
                "Content-Type": "application/zip"
            },
            maxBodyLength: Infinity, 
            maxContentLength: Infinity,
            timeout: 0                 
        });

    } catch (error) {
        onsole.error(status.ERROR, "PutFileOnS3:", error.message);
        throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
};