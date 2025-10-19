import { createClient } from "redis";
import config from "./index.js";

export const redisClient = createClient({ url: config.REDIS_URL });

redisClient.on("ready", () => console.log("Redis ready"));
redisClient.on("connect", () => console.log("Redis connecting"));
redisClient.on("reconnect", () => console.log("Redis reconnecting"));

redisClient.on("error", (err) => {
    console.error("❌ Failed to connect to Redis:", err.message);
    process.exit(1);
});

const connectRedis = async () => {
    if (redisClient.isOpen) return;

    await redisClient.connect();
    console.log("✅ Connected to Redis successfully");
};

export default connectRedis;