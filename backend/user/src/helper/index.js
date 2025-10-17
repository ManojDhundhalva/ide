import crypto from "crypto";

import config from "../config/index.js";

export const random = () => crypto.randomBytes(128).toString("base64");

export const generateSessionToken = (id) => {
    const salt = random();
    return crypto.createHmac("sha256", [salt, id].join("/")).update(config.PASSWORD_SECRET).digest("hex");
};
