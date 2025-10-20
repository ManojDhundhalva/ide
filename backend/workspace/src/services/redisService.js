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

export const redisSetAdd = async (setName, value) => {
    if (!value) return;
    await redisClient.sAdd(setName, value);
};

export const redisSetAddAll = async (setName, values) => {
    if (!values || !Array.isArray(values) || values.length === 0) return;
    await redisClient.sAdd(setName, ...values);
};

export const redisSetExists = async (setName, value) => {
    const exists = await redisClient.sIsMember(setName, value);
    return !!exists; 
};

export const redisSetRemove = async (setName, value) => {
    await redisClient.sRem(setName, value);
};

export const redisSetGetAll = async (setName) => {
    const members = await redisClient.sMembers(setName);
    return Array.isArray(members) ? members : [];
};

export const redisSetExistsByName = async (setName) => {
    const exists = await redisClient.exists(setName);
    return exists === 1;
};
