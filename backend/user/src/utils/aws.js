import { EC2Client, RunInstancesCommand, DescribeInstancesCommand, StopInstancesCommand, StartInstancesCommand, TerminateInstancesCommand } from "@aws-sdk/client-ec2";
import { awsConfig } from "../config/index.js";

const ec2 = new EC2Client({
    region: awsConfig.AWS_REGION,
    credentials: {
        accessKeyId: awsConfig.AWS_ACCESS_KEY_ID,
        secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY
    }
});

// const userDataScript = `
// #!/bin/bash
// export DEBIAN_FRONTEND=noninteractive

// sudo apt update -y
// sudo apt install -y git curl build-essential

// # 1. Fetch the NodeSource setup script and save it
// curl -fsSL https://deb.nodesource.com/setup_lts.x -o /tmp/nodesource_setup.sh

// # 2. Execute the setup script with sudo
// sudo bash /tmp/nodesource_setup.sh

// # 3. Install nodejs (which includes npm)
// sudo apt install -y nodejs

// # Verify installation
// echo "Node version: $(node -v)"
// echo "NPM version: $(npm -v)"

// # --- Existing App Setup ---
// mkdir -p /home/ubuntu/work/app
// cd /home/ubuntu/work/app

// git clone https://github.com/ManojDhundhalva/ide

// cd ide/backend/workspace
// sudo npm install

// # -------- Create systemd service --------
// sudo touch /etc/systemd/system/myapp.service
// sudo nano /etc/systemd/system/myapp.service

// [Unit]
// Description=My Node.js App
// After=network.target

// [Service]
// Type=simple
// User=ubuntu
// WorkingDirectory=/home/ubuntu/work/app/ide/backend/workspace
// ExecStart=/usr/bin/node src/index.js
// Restart=always
// RestartSec=10

// [Install]
// WantedBy=multi-user.target

// # Reload services and enable the app
// sudo systemctl daemon-reload
// sudo systemctl enable myapp.service
// sudo systemctl start myapp.service
// `;

export const createInstance = async (instanceName = "MyEC2Instance") => {
    const params = {
        ImageId: "ami-07c27449ff312c90d",
        InstanceType: "t3.micro",
        MinCount: 1,
        MaxCount: 1,
        SecurityGroupIds: [awsConfig.AWS_SECURITY_GROUP_ID],
        // UserData: Buffer.from(userDataScript).toString("base64"),
        BlockDeviceMappings: [
            {
                DeviceName: "/dev/xvda", // root volume
                Ebs: {
                    VolumeSize: 8, // default 8GB
                    DeleteOnTermination: true,
                },
            },
        ],
        TagSpecifications: [
            {
                ResourceType: "instance",
                Tags: [
                    {
                        Key: "Name",
                        Value: instanceName
                    },
                ]
            }
        ],
    };

    const result = await ec2.send(new RunInstancesCommand(params));
    const instanceId = result.Instances[0].InstanceId;

    console.log("Created Instance: ", instanceId);

    // await stopInstance(instanceId);

    return instanceId;
}

export const getPublicIP = async (instanceId) => {
    const params = { InstanceIds: [instanceId] };

    const data = await ec2.send(new DescribeInstancesCommand(params));
    const ip = data.Reservations[0].Instances[0].PublicIpAddress;

    console.log("Public IP:", ip);
    return ip;
}

export const getPublicDNS = async (instanceId) => {
    const params = { InstanceIds: [instanceId] };

    const data = await ec2.send(new DescribeInstancesCommand(params));
    const instance = data.Reservations[0].Instances[0];

    const dns = instance.PublicDnsName;
    console.log("Public DNS:", dns);

    return dns;
};

export const stopInstance = async (instanceId) => {
    try {
        // First, check the current state of the instance
        const describeParams = { InstanceIds: [instanceId] };
        const data = await ec2.send(new DescribeInstancesCommand(describeParams));
        const instance = data.Reservations[0].Instances[0];
        const currentState = instance.State.Name;

        console.log(`Instance ${instanceId} current state: ${currentState}`);

        // Only stop if the instance is running
        if (currentState === 'running') {
            await ec2.send(new StopInstancesCommand({
                InstanceIds: [instanceId]
            }));
            console.log("Instance stopped:", instanceId);
            // return { 
            //     success: true, 
            //     message: 'Instance stopped successfully', 
            //     previousState: currentState,
            //     currentState: 'stopping' // It enters stopping state immediately
            // };
        }
        // else if (currentState === 'stopped') {
        //     console.log("Instance is already stopped:", instanceId);
        //     return { 
        //         success: true, 
        //         message: 'Instance is already stopped', 
        //         currentState: currentState 
        //     };
        // } else if (currentState === 'stopping') {
        //     console.log("Instance is already stopping:", instanceId);
        //     return { 
        //         success: true, 
        //         message: 'Instance is already in stopping process', 
        //         currentState: currentState 
        //     };
        // } else if (currentState === 'pending') {
        //     console.log("Instance is currently starting, cannot stop now:", instanceId);
        //     return { 
        //         success: false, 
        //         message: 'Instance is currently starting, please wait for it to run first', 
        //         currentState: currentState 
        //     };
        // } else {
        //     console.log("Instance is in unexpected state:", instanceId, currentState);
        //     return { 
        //         success: false, 
        //         message: `Cannot stop instance in ${currentState} state`, 
        //         currentState: currentState 
        //     };
        // }
    } catch (error) {
        console.error("Error stopping instance:", error);
        throw error;
    }
}

// export const stopInstance = async (instanceId) => {
//     await ec2.send(new StopInstancesCommand({
//         InstanceIds: [instanceId]
//     }));

//     console.log("Instance stopped:", instanceId);
// }

// setTimeout(async () => {
//     const id = "i-091eb7e0c2faf63f7";
//     await startInstance(id);
// }, 20 * 1000);

// setTimeout(async () => {
//     const id = "i-091eb7e0c2faf63f7";
//     await stopInstance(id);
// }, 20 * 1000);

// export const startInstance = async (instanceId) => {
//     await ec2.send(new StartInstancesCommand({
//         InstanceIds: [instanceId]
//     }));

//     console.log("Instance started:", instanceId);
// }

export const startInstance = async (instanceId) => {
    try {
        // First, check the current state of the instance
        const describeParams = { InstanceIds: [instanceId] };
        const data = await ec2.send(new DescribeInstancesCommand(describeParams));
        const instance = data.Reservations[0].Instances[0];
        const currentState = instance.State.Name;

        console.log(`Instance ${instanceId} current state: ${currentState}`);

        // Only start if the instance is stopped
        if (currentState === 'stopped') {
            await ec2.send(new StartInstancesCommand({
                InstanceIds: [instanceId]
            }));
            console.log("Instance started:", instanceId);
            // return { success: true, message: 'Instance started successfully', previousState: currentState };
        }
        // else if (currentState === 'running') {
        //     console.log("Instance is already running:", instanceId);
        //     return { success: true, message: 'Instance is already running', currentState: currentState };
        // } else if (currentState === 'stopping') {
        //     console.log("Instance is currently stopping, please wait:", instanceId);
        //     return { success: false, message: 'Instance is currently stopping, please wait', currentState: currentState };
        // } else if (currentState === 'pending') {
        //     console.log("Instance is currently starting:", instanceId);
        //     return { success: false, message: 'Instance is currently starting', currentState: currentState };
        // } else {
        //     console.log("Instance is in unexpected state:", instanceId, currentState);
        //     return { success: false, message: `Instance is in ${currentState} state`, currentState: currentState };
        // }
    } catch (error) {
        console.error("Error starting instance:", error);
        throw error;
    }
}

export const deleteInstance = async (instanceId) => {
    await ec2.send(new TerminateInstancesCommand({
        InstanceIds: [instanceId]
    }));

    console.log("Instance deleted:", instanceId);
};

export const getInstanceStatus = async (instanceId) => {
    try {
        const params = { InstanceIds: [instanceId] };
        const data = await ec2.send(new DescribeInstancesCommand(params));

        const instance = data.Reservations[0].Instances[0];
        const state = instance.State.Name;       // running | stopped | pending | stopping | terminated

        console.log(`Instance ${instanceId} status: ${state}`);

        return state; 
    } catch (error) {
        console.error("Error getting instance status:", error);
        throw error;
    }
};