import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        projectName: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        metadata: {
            expandedDirectories: {
                type: [String],
                default: [],
            },
            tabs: {
                tabList: {
                    type: [String],
                    default: []
                },
                activeTab: {
                    type: String,
                    default: null
                },
            },
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: false,
        },
    },
    { timestamps: true }
);

projectSchema.index({ userId: 1, projectName: 1 }, { unique: true });

export const ProjectModel =  mongoose.model("Project", projectSchema);
