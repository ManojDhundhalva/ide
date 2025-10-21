import { getObject, putObject } from "../config/aws.js";

export const getObjectUrl = (req, res) => {
    try {   
        const { _id: userId } = req.identity;
        const { projectId } = req.params;

        const url = getObject(userId, projectId);
        return res.status(200).json({ message: "Get presigned URL generated", url });   
    } catch (error) {
        console.error("GetObjectUrl error:", err);
        return res.status(500).json({ message: "Failed to generate get presigned URL" });
    }  
};

export const putObjectUrl = (req, res) => {
    try {   
        const { _id: userId } = req.identity;
        const { projectId } = req.params;

        const url = putObject(userId, projectId);
        return res.status(200).json({ message: "Put presigned URL generated", url });   
    } catch (error) {
        console.error("PutObjectUrl error:", err);
        return res.status(500).json({ message: "Failed to generate put presigned URL" });
    }
};