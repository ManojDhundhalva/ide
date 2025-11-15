import { ECRClient, BatchGetImageCommand, PutImageCommand } from "@aws-sdk/client-ecr";
import { ECSClient, RegisterTaskDefinitionCommand, RunTaskCommand, DescribeTaskDefinitionCommand } from "@aws-sdk/client-ecs";
import { awsConfig } from "../config/index.js";

const ecrClient = new ECRClient({
    region: awsConfig.AWS_REGION,
    credentials: {
        accessKeyId: awsConfig.AWS_ACCESS_KEY_ID,
        secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY
    }
});

const ecsClient = new ECSClient({
    region: awsConfig.AWS_REGION,
    credentials: {
        accessKeyId: awsConfig.AWS_ACCESS_KEY_ID,
        secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY
    }
});

// 1. Duplicate Image in ECR
const createImage = async (projectId) => {
    const sourceRepo = awsConfig.AWS_DEFAULT_REPOSITORY_NAME;
    const sourceTag = awsConfig.AWS_DEFAULT_REPOSITORY_TAG;

    const getRes = await ecrClient.send(new BatchGetImageCommand({
        repositoryName: sourceRepo,
        imageIds: [{ imageTag: sourceTag }],
    }));

    if (!getRes.images || getRes.images.length === 0) throw new Error("Source image not found");

    const manifest = getRes.images[0].imageManifest;

    await ecrClient.send(new PutImageCommand({
        repositoryName: sourceRepo,
        imageManifest: manifest,
        imageTag: projectId,
    }));

    return `${awsConfig.AWS_ACCOUNT_ID}.dkr.ecr.${awsConfig.AWS_REGION}.amazonaws.com/${sourceRepo}:${projectId}`;
};

// 2. Register ECS Task Definition for this image
const registerTaskDefinition = async (projectId, imageUri) => {
    const baseTaskDefName = awsConfig.AWS_BASE_TASK_DEF_NAME; // "my-task-definition"; // your existing task definition
    const { taskDefinition } = await ecsClient.send(new DescribeTaskDefinitionCommand({
        taskDefinition: baseTaskDefName,
    }));

    const containerDef = taskDefinition.containerDefinitions.map(c => ({
        ...c,
        image: imageUri, // set new image
    }));

    const res = await ecsClient.send(new RegisterTaskDefinitionCommand({
        family: `${baseTaskDefName}-${projectId}`, // unique task family
        networkMode: taskDefinition.networkMode,
        containerDefinitions: containerDef,
        cpu: taskDefinition.cpu,
        memory: taskDefinition.memory,
        requiresCompatibilities: taskDefinition.requiresCompatibilities,
        executionRoleArn: taskDefinition.executionRoleArn,
        taskRoleArn: taskDefinition.taskRoleArn,
    }));

    return res.taskDefinition.taskDefinitionArn;
};

// 3. Run ECS Task (Container)
const runContainer = async (taskDefArn) => {
    const params = {
        cluster: awsConfig.AWS_ECS_CLUSTER, // "my-ecs-cluster",
        taskDefinition: taskDefArn,
        launchType: "FARGATE",
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: ["subnet-083be9483d4ffc38f", "subnet-031a6ed798fff1701", "subnet-0c5764fd4ce263c5c", "subnet-0160f7319411b2781", "subnet-0e47c0d2c9f8536ad", "subnet-0a29e64099112136e"], // your subnet
                assignPublicIp: "ENABLED",
            },
        },
    };

    const res = await ecsClient.send(new RunTaskCommand(params));
    console.log("Container started:", res.tasks[0].taskArn);
};

// 4. Full Flow
export const startProjectContainer = async (projectId) => {
    try {
        const imageUri = await createImage(projectId);
        const taskDefArn = await registerTaskDefinition(projectId, imageUri);
        await runContainer(taskDefArn);
    } catch (err) {
        console.error("Error starting project container:", err);
    }
};