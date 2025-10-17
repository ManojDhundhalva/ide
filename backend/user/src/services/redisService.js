import { redisClient } from "../config/redis.js";

export const redisGet = async (key) => {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
};

export const redisSet = async (key, value, ttlSeconds = null) => {
    const string = JSON.stringify(value);
    if (ttlSeconds) {
        await redisClient.setEx(key, ttlSeconds, string);
    } else {
        await redisClient.set(key, string);
    }
};

export const redisDel = async (key) => {
    await redisClient.del(key);
};
