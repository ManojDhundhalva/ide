import dotenv from "dotenv";

dotenv.config();

const config = {
    PORT: Number(process.env.PORT),
    CLIENT_URL: String(process.env.CLIENT_URL)
};

export default config;