import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        name: { 
            type: String, 
            required: true
        },
        image: { 
            type: String, 
            required: true 
        },
        email: { 
            type: String, 
            required: true, 
            unique: true 
        },
        sessionToken: { 
            type: String, 
            unique: true, 
            select: false 
        },
        projects: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Project",
            },
        ],
    },
    { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);