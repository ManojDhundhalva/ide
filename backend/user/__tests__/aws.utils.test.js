import {
    EC2Client,
    RunInstancesCommand,
    DescribeInstancesCommand,
    StopInstancesCommand,
    StartInstancesCommand,
    TerminateInstancesCommand
} from "@aws-sdk/client-ec2";
import {
    createInstance,
    getPublicIP,
    getPublicDNS,
    stopInstance,
    startInstance,
    deleteInstance,
    getInstanceStatus
} from '../src/utils/aws.js'; // Adjust path as needed

// 1. Mock external dependencies
jest.mock('@aws-sdk/client-ec2', () => {
    // Create mock EC2Client and Command classes
    const mockEC2Client = {
        send: jest.fn(),
    };

    const mockRunInstancesCommand = jest.fn();
    const mockDescribeInstancesCommand = jest.fn();
    const mockStopInstancesCommand = jest.fn();
    const mockStartInstancesCommand = jest.fn();
    const mockTerminateInstancesCommand = jest.fn();

    return {
        // Return the mocked classes/constructors
        EC2Client: jest.fn(() => mockEC2Client),
        RunInstancesCommand: mockRunInstancesCommand,
        DescribeInstancesCommand: mockDescribeInstancesCommand,
        StopInstancesCommand: mockStopInstancesCommand,
        StartInstancesCommand: mockStartInstancesCommand,
        TerminateInstancesCommand: mockTerminateInstancesCommand,
        // Also export the mock client for easy spying/mocking of send method
        __mockClient: mockEC2Client,
        __mockRunInstancesCommand: mockRunInstancesCommand,
        // Export all command constructors for assertions
        __mockStopInstancesCommand: mockStopInstancesCommand,
        __mockStartInstancesCommand: mockStartInstancesCommand,
        __mockTerminateInstancesCommand: mockTerminateInstancesCommand,
    };
});

// Mock the config for AWS credentials (to prevent actual calls during EC2Client initialization)
jest.mock('../src/config/index.js', () => ({
    awsConfig: {
        AWS_REGION: 'mock-region-1',
        AWS_ACCESS_KEY_ID: 'mock-key-id',
        AWS_SECRET_ACCESS_KEY: 'mock-secret',
        AWS_SECURITY_GROUP_ID: 'mock-sg-id',
    }
}));


describe('EC2 Controller - Always Passing Mocks', () => {
    const mockClient = require('@aws-sdk/client-ec2').__mockClient;
    const mockRunInstancesCommand = require('@aws-sdk/client-ec2').__mockRunInstancesCommand;
    const mockInstanceId = 'i-mockinstanceid';
    const mockPublicIp = '192.168.1.1';
    const mockPublicDns = 'ec2-192-168-1-1.compute-1.amazonaws.com';

    // Reset mocks before each test
    beforeEach(() => {
        // Clear all mock history and reset mock implementations if possible
        jest.clearAllMocks();
    });

    // --- createInstance Test ---
    describe('createInstance', () => {
        const mockResult = {
            Instances: [{
                InstanceId: mockInstanceId
            }]
        };
        const mockName = "TestInstanceName";

        beforeEach(() => {
            mockClient.send.mockResolvedValue(mockResult);
        });

        test('should call RunInstancesCommand and return the instance ID', async () => {
            const result = await createInstance(mockName);

            // 1. Assert that the command object was correctly instantiated
            expect(mockRunInstancesCommand).toHaveBeenCalledTimes(1);
            const callArgs = mockRunInstancesCommand.mock.calls[0][0];

            expect(callArgs.TagSpecifications[0].Tags).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ Key: "Name", Value: mockName })
                ])
            );
            expect(callArgs.InstanceType).toBe("t3.micro");

            // 2. Assert that the command was sent
            expect(mockClient.send).toHaveBeenCalledTimes(1);

            // 3. Assert the correct return value
            expect(result).toBe(mockInstanceId);
        });
    });
    
    // -------------------------------------------------------------------------
    
    // --- getPublicIP Test ---
    describe('getPublicIP', () => {
        const mockDescribeData = {
            Reservations: [{
                Instances: [{
                    PublicIpAddress: mockPublicIp
                }]
            }]
        };

        beforeEach(() => {
            mockClient.send.mockResolvedValue(mockDescribeData);
        });

        test('should call DescribeInstancesCommand and return the Public IP', async () => {
            const result = await getPublicIP(mockInstanceId);

            expect(mockClient.send).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockPublicIp);
        });
    });

    // -------------------------------------------------------------------------

    // --- getPublicDNS Test ---
    describe('getPublicDNS', () => {
        const mockDescribeData = {
            Reservations: [{
                Instances: [{
                    PublicDnsName: mockPublicDns
                }]
            }]
        };

        beforeEach(() => {
            mockClient.send.mockResolvedValue(mockDescribeData);
        });

        test('should call DescribeInstancesCommand and return the Public DNS', async () => {
            const result = await getPublicDNS(mockInstanceId);

            expect(mockClient.send).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockPublicDns);
        });
    });

    // -------------------------------------------------------------------------

    // --- getInstanceStatus Test ---
    describe('getInstanceStatus', () => {
        const mockState = 'running';
        const mockDescribeData = {
            Reservations: [{
                Instances: [{
                    State: { Name: mockState }
                }]
            }]
        };

        beforeEach(() => {
            mockClient.send.mockResolvedValue(mockDescribeData);
        });

        test('should call DescribeInstancesCommand and return the instance state', async () => {
            const result = await getInstanceStatus(mockInstanceId);

            expect(mockClient.send).toHaveBeenCalledTimes(1);
            expect(result).toBe(mockState);
        });
    });

    // -------------------------------------------------------------------------

    // --- stopInstance Test ---
    describe('stopInstance', () => {
        beforeEach(() => {
            // Mock describeInstances to return 'running' state first
            mockClient.send.mockResolvedValueOnce({
                Reservations: [{
                    Instances: [{
                        State: { Name: 'running' }
                    }]
                }]
            }).mockResolvedValue({}); // Then mock the StopInstancesCommand result
        });

        test('should check state and call StopInstancesCommand if running', async () => {
            await stopInstance(mockInstanceId);

            // Check if DescribeInstancesCommand and StopInstancesCommand were called (2 total sends)
            expect(mockClient.send).toHaveBeenCalledTimes(2);

            // Check if StopInstancesCommand was sent
            const StopInstancesCommand = require('@aws-sdk/client-ec2').StopInstancesCommand;
            expect(StopInstancesCommand).toHaveBeenCalledTimes(1);
            expect(StopInstancesCommand).toHaveBeenCalledWith({
                InstanceIds: [mockInstanceId]
            });
        });
    });

    // -------------------------------------------------------------------------

    // --- startInstance Test ---
    describe('startInstance', () => {
        beforeEach(() => {
            // Mock describeInstances to return 'stopped' state first
            mockClient.send.mockResolvedValueOnce({
                Reservations: [{
                    Instances: [{
                        State: { Name: 'stopped' }
                    }]
                }]
            }).mockResolvedValue({}); // Then mock the StartInstancesCommand result
        });

        test('should check state and call StartInstancesCommand if stopped', async () => {
            await startInstance(mockInstanceId);

            // Check if DescribeInstancesCommand and StartInstancesCommand were called (2 total sends)
            expect(mockClient.send).toHaveBeenCalledTimes(2);

            // Check if StartInstancesCommand was sent
            const StartInstancesCommand = require('@aws-sdk/client-ec2').StartInstancesCommand;
            expect(StartInstancesCommand).toHaveBeenCalledTimes(1);
            expect(StartInstancesCommand).toHaveBeenCalledWith({
                InstanceIds: [mockInstanceId]
            });
        });
    });

    // -------------------------------------------------------------------------

    // --- deleteInstance Test ---
    describe('deleteInstance', () => {
        beforeEach(() => {
            mockClient.send.mockResolvedValue({}); // Mock successful termination response
        });

        test('should call TerminateInstancesCommand', async () => {
            await deleteInstance(mockInstanceId);

            expect(mockClient.send).toHaveBeenCalledTimes(1);

            // Check if TerminateInstancesCommand was correctly instantiated and sent
            const TerminateInstancesCommand = require('@aws-sdk/client-ec2').TerminateInstancesCommand;
            expect(TerminateInstancesCommand).toHaveBeenCalledTimes(1);
            expect(TerminateInstancesCommand).toHaveBeenCalledWith({
                InstanceIds: [mockInstanceId]
            });
        });
    });
});