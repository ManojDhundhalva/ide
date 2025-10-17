import fetch from "node-fetch";
import { oauth2client } from "../config/google.js";

export const fetchGoogleProfile = async (code) => {
    if (!code) throw new TypeError("fetchGoogleProfile: Authorization code is required");

    const googleResponse = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleResponse.tokens);

    const url = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`;
    const resp = await fetch(url);

    if (!resp.ok) {
        throw new Error("Failed to fetch user info from Google");
    }

    const { email, name, picture: image } = await resp.json();

    if (!email || !name || !image || email.trim() === "" || name.trim() === "" || image.trim() === "") {
        throw new Error("Incomplete Google profile: email, name, and picture are required");
    }

    return { email, name, image };
};