import { awsConfig } from "../config/index.js";
// import { ECRClient, BatchGetImageCommand, PutImageCommand } from "@aws-sdk/client-ecr";
// import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";

import util from "util";
import { exec } from "child_process";
const execPromise = util.promisify(exec);

// const ecrClient = new ECRClient({
//     region: awsConfig.AWS_REGION,
//     credentials: {
//         accessKeyId: awsConfig.AWS_ACCESS_KEY_ID,
//         secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY
//     }
// });

// const ecsClient = new ECSClient({ 
//     region: "ap-south-1",     
//     credentials: {
//         accessKeyId: awsConfig.AWS_ACCESS_KEY_ID,
//         secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY
//     }
// });

export const createAndStartContainer = async (projectId) => {
    const region = awsConfig.AWS_REGION;
    const accountId = awsConfig.AWS_ACCOUNT_ID;
    const sourceRepo = awsConfig.AWS_DEFAULT_REPOSITORY_NAME;
    const sourceTag = awsConfig.AWS_DEFAULT_REPOSITORY_TAG;
    const destinationRepo = projectId;
    const destinationTag = awsConfig.AWS_DEFAULT_REPOSITORY_TAG;

    const src = `${accountId}.dkr.ecr.${region}.amazonaws.com/${sourceRepo}:${sourceTag}`;
    const dest = `${accountId}.dkr.ecr.${region}.amazonaws.com/${destinationRepo}:${destinationTag}`;

    try {
        await execPromise(`aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${accountId}.dkr.ecr.${region}.amazonaws.com`);
        await execPromise(`docker pull ${src}`);
        await execPromise(`docker tag ${src} ${dest}`);
        await execPromise(`docker push ${dest}`);
        console.log(`Image duplicated to ${dest}`);
        return dest;
    } catch (err) {
        console.error("Failed to duplicate image:", err.message);
    }
};

// const runECRContainer = async () => {
//     const params = {
//         cluster: "my-ecs-cluster", // must exist
//         taskDefinition: "my-task-definition", // must exist and use your ECR image
//         launchType: "FARGATE", // or "EC2"
//         networkConfiguration: {
//             awsvpcConfiguration: {
//                 subnets: ["subnet-xxxxxxx"], // must exist
//                 assignPublicIp: "ENABLED",
//             },
//         },
//     };

//     try {
//         const res = await ecsClient.send(new RunTaskCommand(params));
//         console.log("Container started:", res.tasks[0].taskArn);
//     } catch (err) {
//         console.error("Error running container:", err);
//     }
// };