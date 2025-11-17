import pkg from 'lodash';

const { get, merge } = pkg;

import { getUserBySessionToken } from "../services/userService.js";
import { getUserIdByProjectId } from '../services/projectService.js';

import cache from "../utils/cache.js";

export const isOwner = async (req, res, next) => {
    try {
        const { projectId } = req.params;

        const currentUserId = get(req, "identity._id", "");

        if (!currentUserId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const { userId: storedUserId } = await getUserIdByProjectId(projectId);

        if (storedUserId.toString() !== currentUserId) {
            return res.status(403).json({ message: "You do not have permission to access this resource" });
        }

        next();

    } catch (error) {
        console.error("isOwner middleware error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const isAuthenticated = async (req, res, next) => {
    try {
        const sessionToken = req.headers["x-session-token"];

        if (!sessionToken) {
            return res.status(401).json({ message: "Authentication token missing" });
        }

        let existingUser = cache.get(`session:${sessionToken}`); 

        if(!existingUser) {

            existingUser = await getUserBySessionToken(sessionToken);
            
            if (!existingUser) {
                return res.status(403).json({ message: "Invalid or expired session token" });
            }
            
            cache.set(`session:${sessionToken}`, existingUser);
        }

        merge(req, { identity: existingUser });

        return next();

    } catch (error) {
        console.error("Authentication middleware error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}