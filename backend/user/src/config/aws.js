import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import config from "./index.js";

const s3Client = new S3Client({
    region: config.AWS_REGION,
    credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    },
});

export const getObject = async (userId, fileName) => {
    const command = new GetObjectCommand({ 
        Bucket: config.AWS_BUCKET_NAME, 
        Key: `uploads/${userId}/${fileName}`,
    });
    const url = await getSignedUrl(s3Client, command);
    return url;
};

export const putObject = async (userId, fileName) => {
    const command = new PutObjectCommand({ 
        Bucket: config.AWS_BUCKET_NAME, 
        Key: `uploads/${userId}/${fileName}`, 
        ContentType: "application/zip"
    });

    const url = await getSignedUrl(s3Client, command);
    return url;
};