import { awsConfig } from "../config/index.js";

export const getCreadentials = (req, res) => {
    return res.status(200).json({ message: "Credentials retrieved successfully", creadentials: awsConfig });
};