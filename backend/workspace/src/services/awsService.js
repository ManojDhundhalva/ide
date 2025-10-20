import { s3Client } from "../config/aws.js";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export const getObjectUrl = async (key) => {
    const command = new GetObjectCommand({ Bucket: config.AWS_BUCKET_NAME, Key: key });
    const url = await getSignedUrl(s3Client, command);
    return url;
};