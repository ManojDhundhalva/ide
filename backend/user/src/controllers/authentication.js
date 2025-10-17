import { createUser, getUserByEmail, isUserExistsByEmail } from "../services/userService.js";
import { fetchGoogleProfile } from "../services/googleService.js";
import { redisDel, redisSet } from "../services/redisService.js";
import { generateSessionToken } from "../helper/index.js";

export const authenticate = async (req, res) => {

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: "Authorization code is required" });
    }

    let data;

    try {
        data = await fetchGoogleProfile(code);
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(502).json({ message: "Failed to fetch user info from Google" });
    }

    const { email, name, image } = data;

    let isUserExists;

    try {
        isUserExists = await isUserExistsByEmail(email);
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(502).json({ message: "Failed to verify user existence by email" });   
    }

    if (!isUserExists) {
        try {
            await createUser({
                email,
                name,
                image,
            });
        } catch (error) {
            console.error("Authentication error:", error);
            return res.status(502).json({ message: "Failed to create user" });
        }
    }

    let user;

    try {
        user = await getUserByEmail(email);
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(502).json({ message: "Failed to fetch user by email" });   
    }

    const sessionToken = generateSessionToken(user._id.toString());

    try {
        await redisSet(`session:${sessionToken}`, user, 24 * 60 * 60);
        user.sessionToken = sessionToken;
        await user.save();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(502).json({ message: "Failed to generate and save session token" });   
    }

    res.cookie("SESSION-TOKEN", user.sessionToken, { 
        domain: "localhost", 
        path: "/", 
        maxAge: 24 * 60 * 60 * 1000 
    });

    const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
    };

    return res.status(200).json({ message: "Authentication successful", user: userData });
};

export const logout = async(req, res) => {

    const sessionToken = req.cookies["SESSION-TOKEN"];

    if(sessionToken) {

        await redisDel(`session:${sessionToken}`);

        res.cookie("SESSION-TOKEN", "", { 
            domain: "localhost", 
            expires: new Date(0), 
            path: "/" 
        });
    }

    return res.status(200).json({ message: "Logged out successfully" });
}