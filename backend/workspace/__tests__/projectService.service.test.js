import {
    getProject,
    stopEC2
} from '../src/services/projectService.js'; 
import {
    api
} from "../src/config/api.js";
import {
    createFolderToBaseDir
} from "../src/utils/files.js";
import cache from "../src/utils/cache.js";

// 1. Mock external dependencies
jest.mock("../src/config/api.js", () => ({
    api: {
        get: jest.fn(),
    },
}));
jest.mock("../src/utils/files.js", () => ({
    createFolderToBaseDir: jest.fn(),
}));
jest.mock("../src/utils/cache.js", () => ({
    get: jest.fn(),
    set: jest.fn(),
    addEntriesInSet: jest.fn(),
}));

// Mock console.error to keep test output clean
console.error = jest.fn();

describe('Project Controllers - Always Passing Success', () => {

    const mockProjectId = "mock-project-123";
    const mockSessionToken = "mock-session-token-xyz";
    const mockProjectData = {
        project: {
            _id: mockProjectId,
            userId: "mock-user-id",
            projectName: "TestProjectName",
            description: "A description",
            metadata: {
                tabs: {
                    activeTab: "index.js",
                    tabList: ["index.js", "style.css"]
                },
                expandedDirectories: ["src", "public"]
            }
        }
    };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Configure Cache Mocks for Success Path
        cache.get.mockReturnValue(mockSessionToken);

        // Configure API Mock for Success Path
        api.get.mockResolvedValue({
            data: mockProjectData
        });

        // Configure file system mock for Success Path
        createFolderToBaseDir.mockResolvedValue(undefined);
    });

    // --- getProject Tests ---
    describe('getProject', () => {

        test('should fetch project data, update cache, create folder, and return true on success', async () => {
            const result = await getProject(mockProjectId);

            // 1. Assertions for API Call
            expect(api.get).toHaveBeenCalledTimes(1);
            expect(api.get).toHaveBeenCalledWith(
                `/project/${mockProjectId}`,
                expect.objectContaining({
                    headers: {
                        "X-SESSION-TOKEN": mockSessionToken
                    }
                })
            );

            // 2. Assertions for Cache Reads/Writes
            expect(cache.get).toHaveBeenCalledWith("user:sessionToken");

            expect(cache.set).toHaveBeenCalledWith("user:project:userId", mockProjectData.project.userId);
            expect(cache.set).toHaveBeenCalledWith("user:project:projectId", mockProjectData.project._id);
            expect(cache.set).toHaveBeenCalledWith("user:project:projectName", mockProjectData.project.projectName);
            expect(cache.set).toHaveBeenCalledWith("user:project:description", mockProjectData.project.description);
            expect(cache.set).toHaveBeenCalledWith("user:project:activeTab", mockProjectData.project.metadata.tabs.activeTab);

            expect(cache.addEntriesInSet).toHaveBeenCalledWith("user:project:tabList", mockProjectData.project.metadata.tabs.tabList);
            expect(cache.addEntriesInSet).toHaveBeenCalledWith("file-explorer-expanded", mockProjectData.project.metadata.expandedDirectories);

            // 3. Assertions for Folder Creation
            expect(createFolderToBaseDir).toHaveBeenCalledTimes(1);
            expect(createFolderToBaseDir).toHaveBeenCalledWith(mockProjectData.project.projectName);

            // 4. Assertions for Return Value
            expect(result).toBe(true);

            // 5. Ensure error logging was not called
            expect(console.error).not.toHaveBeenCalled();
        });
    });

    // --- stopEC2 Tests ---
    describe('stopEC2', () => {

        test('should fetch session token and successfully call the stop EC2 API', async () => {
            await stopEC2(mockProjectId);

            // 1. Assertions for Cache Read
            expect(cache.get).toHaveBeenCalledWith("user:sessionToken");

            // 2. Assertions for API Call
            expect(api.get).toHaveBeenCalledTimes(1);
            expect(api.get).toHaveBeenCalledWith(
                `/project/stop/${mockProjectId}`,
                expect.objectContaining({
                    headers: {
                        "X-SESSION-TOKEN": mockSessionToken
                    }
                })
            );

            // 3. Ensure no error was logged
            expect(console.error).not.toHaveBeenCalled();
        });
    });
});