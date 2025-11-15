import { EC2Client, RunInstancesCommand, DescribeInstancesCommand, StopInstancesCommand, StartInstancesCommand } from "@aws-sdk/client-ec2";

const ec2 = new EC2Client({
    region: awsConfig.AWS_REGION,
    credentials: {
        accessKeyId: awsConfig.AWS_ACCESS_KEY_ID,
        secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY
    }
});

// add permission "0.0.0.0/0"
export const createInstance = async () => {
    const params = {
        ImageId: "ami-0c1a7f89451184c8b", // Example: Amazon Linux 2 in ap-south-1
        InstanceType: "t2.micro",
        MinCount: 1,
        MaxCount: 1
    };

    const result = await ec2.send(new RunInstancesCommand(params));
    const instanceId = result.Instances[0].InstanceId;

    console.log("Created Instance: ", instanceId);
    return instanceId;
}

export const getPublicIP = async (instanceId) => {
    const params = { InstanceIds: [instanceId] };

    const data = await ec2.send(new DescribeInstancesCommand(params));
    const ip = data.Reservations[0].Instances[0].PublicIpAddress;

    console.log("Public IP:", ip);
    return ip;
}

export const stopInstance = async (instanceId) => {
    await ec2.send(new StopInstancesCommand({
        InstanceIds: [instanceId]
    }));

    console.log("Instance stopped:", instanceId);
}


export const startInstance = async (instanceId) => {
    await ec2.send(new StartInstancesCommand({
        InstanceIds: [instanceId]
    }));

    console.log("Instance started:", instanceId);
}