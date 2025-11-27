import dotenv from "dotenv";

dotenv.config();

const config = {
    PORT: Number(process.env.PORT),
    MONGO_URI: String(process.env.MONGO_URI),
    PASSWORD_SECRET: String(process.env.PASSWORD_SECRET),
    GOOGLE_CLIENT_ID: String(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: String(process.env.GOOGLE_CLIENT_SECRET)
};

export const awsConfig = {
    AWS_ACCOUNT_ID: String(process.env.AWS_ACCOUNT_ID),
    AWS_REPOSITORY_NAME: String(process.env.AWS_REPOSITORY_NAME),
    AWS_DEFAULT_REPOSITORY_NAME: String(process.env.AWS_DEFAULT_REPOSITORY_NAME),
    AWS_DEFAULT_REPOSITORY_TAG: String(process.env.AWS_DEFAULT_REPOSITORY_TAG),
    AWS_REGION: String(process.env.AWS_REGION),
    AWS_ACCESS_KEY_ID: String(process.env.AWS_ACCESS_KEY_ID),
    AWS_SECRET_ACCESS_KEY: String(process.env.AWS_SECRET_ACCESS_KEY),
    AWS_BASE_TASK_DEF_NAME: String(process.env.AWS_BASE_TASK_DEF_NAME),
    AWS_ECS_CLUSTER: String(process.env.AWS_ECS_CLUSTER),
};

export default config;
