import dotenv from "dotenv";

dotenv.config();

const config = {
    PORT: Number(process.env.PORT),
    BASE_DIR: String(process.env.BASE_DIR),
    BACKEND_API: String(process.env.BACKEND_API),
    CLIENT_URL: String(process.env.CLIENT_URL)
};

export default config;