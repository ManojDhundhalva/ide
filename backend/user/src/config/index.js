import dotenv from "dotenv";

dotenv.config();

const config = {
  PORT: Number(process.env.PORT),
  MONGO_URI: String(process.env.MONGO_URI),
  REDIS_URL: String(process.env.REDIS_URL),
  PASSWORD_SECRET: String(process.env.PASSWORD_SECRET),
  GOOGLE_CLIENT_ID: String(process.env.GOOGLE_CLIENT_ID),
  GOOGLE_CLIENT_SECRET: String(process.env.GOOGLE_CLIENT_SECRET),
  WORKSPACE_URL: String(process.env.WORKSPACE_URL),
  CLIENT_URL: String(process.env.CLIENT_URL)
};

export default config;
