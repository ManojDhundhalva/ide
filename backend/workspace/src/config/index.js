import dotenv from "dotenv";

dotenv.config();

const config = {
    PORT: Number(process.env.PORT),
    BASE_PATH: String(process.env.BASE_PATH),
    AWS_BUCKET_NAME: String(process.env.AWS_BUCKET_NAME),
    AWS_REGION: String(process.env.AWS_REGION),
    AWS_ACCESS_KEY_ID: String(process.env.AWS_ACCESS_KEY_ID),
    AWS_SECRET_ACCESS_KEY: String(process.env.AWS_SECRET_ACCESS_KEY),
    BACKEND_API: String(process.env.BACKEND_API),
    CLIENT_URL: String(process.env.CLIENT_URL)
};

export default config;