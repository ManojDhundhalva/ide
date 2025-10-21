import dotenv from "dotenv";

dotenv.config();

const config = {
    PORT: Number(process.env.PORT),
    MONGO_URI: String(process.env.MONGO_URI),
    REDIS_URL: String(process.env.REDIS_URL),
    PASSWORD_SECRET: String(process.env.PASSWORD_SECRET),
    GOOGLE_CLIENT_ID: String(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: String(process.env.GOOGLE_CLIENT_SECRET),
    AWS_BUCKET_NAME: String(process.env.AWS_BUCKET_NAME),
    AWS_REGION: String(process.env.AWS_REGION),
    AWS_ACCESS_KEY_ID: String(process.env.AWS_ACCESS_KEY_ID),
    AWS_SECRET_ACCESS_KEY: String(process.env.AWS_SECRET_ACCESS_KEY),
    WORKSPACE_URL: String(process.env.WORKSPACE_URL),
    CLIENT_URL: String(process.env.CLIENT_URL)
};

export default config;
