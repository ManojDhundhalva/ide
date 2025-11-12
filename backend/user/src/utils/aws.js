import { awsConfig } from "../config/index.js";
import { ECRClient, BatchGetImageCommand, PutImageCommand } from "@aws-sdk/client-ecr";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";

const ecrClient = new ECRClient({
    region: awsConfig.AWS_REGION,
    credentials: {
        accessKeyId: awsConfig.AWS_ACCESS_KEY_ID,
        secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY
    }
});

const ecsClient = new ECSClient({ 
    region: "ap-south-1",     
    credentials: {
        accessKeyId: awsConfig.AWS_ACCESS_KEY_ID,
        secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY
    }
});

export const createAndStartContainer = async (projectId) => {
    const sourceRepo = awsConfig.AWS_DEFAULT_REPOSITORY_NAME;
    const sourceTag = awsConfig.AWS_DEFAULT_REPOSITORY_TAG;
    const destinationRepo = awsConfig.AWS_DEFAULT_REPOSITORY_NAME;
    const destinationTag = projectId;

    try {
        const getRes = await ecrClient.send(
            new BatchGetImageCommand({
                repositoryName: sourceRepo,
                imageIds: [{ imageTag: sourceTag }],
            })
        );

        if (!getRes.images || getRes.images.length === 0) {
            throw new Error("Source image not found in ECR");
        }

        const manifest = getRes.images[0].imageManifest;

        const putRes = await ecrClient.send(
            new PutImageCommand({
                repositoryName: destinationRepo,
                imageManifest: manifest,
                imageTag: destinationTag,
            })
        );

        console.log("Image duplicated successfully:");
        console.log(putRes.image);
    } catch (err) {
        console.error("Error duplicating image:", err);
    }
};

const runECRContainer = async () => {
    const params = {
        cluster: "my-ecs-cluster", // must exist
        taskDefinition: "my-task-definition", // must exist and use your ECR image
        launchType: "FARGATE", // or "EC2"
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: ["subnet-xxxxxxx"], // must exist
                assignPublicIp: "ENABLED",
            },
        },
    };

    try {
        const res = await ecsClient.send(new RunTaskCommand(params));
        console.log("Container started:", res.tasks[0].taskArn);
    } catch (err) {
        console.error("Error running container:", err);
    }
};