import { saveMetadata } from '../src/services/fileServices.js'; 
import { api } from "../src/config/api.js";
import cache from "../src/utils/cache.js";

// 1. Mock external dependencies
jest.mock("../src/config/api.js", () => ({
    api: {
        put: jest.fn(),
    },
}));
jest.mock("../src/utils/cache.js", () => ({
    get: jest.fn(),
    getAllEntriesInSet: jest.fn(),
}));

// Mock console.error to prevent test output pollution for non-critical paths
console.error = jest.fn();

describe('saveMetadata Controller - Always Passing Success', () => {

    const mockSessionToken = "mock-token-123";
    const mockProjectId = "mock-project-id-xyz";
    const mockExpandedDirs = ['/src', '/public/css'];
    const mockTabList = ['file1.js', 'file2.html'];
    const mockActiveTab = 'file1.js';

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // 2. Configure Cache Mocks for Success Path
        cache.get.mockImplementation((key) => {
            if (key === "user:sessionToken") return mockSessionToken;
            if (key === "user:project:projectId") return mockProjectId;
            if (key === "user:project:activeTab") return mockActiveTab;
            return undefined;
        });

        cache.getAllEntriesInSet.mockImplementation((key) => {
            if (key === "file-explorer-expanded") return mockExpandedDirs;
            if (key === "user:project:tabList") return mockTabList;
            return [];
        });

        // 3. Configure API Mock for Success Path
        api.put.mockResolvedValue({
            data: {
                message: "Metadata saved successfully"
            }
        });
    });

    test('should fetch all data from cache and successfully call the API', async () => {
        await saveMetadata();

        // 4. Assertions for Cache Calls
        expect(cache.get).toHaveBeenCalledWith("user:sessionToken");
        expect(cache.get).toHaveBeenCalledWith("user:project:projectId");
        expect(cache.getAllEntriesInSet).toHaveBeenCalledWith("file-explorer-expanded");
        expect(cache.getAllEntriesInSet).toHaveBeenCalledWith("user:project:tabList");
        expect(cache.get).toHaveBeenCalledWith("user:project:activeTab");

        // 5. Assertions for API Call
        expect(api.put).toHaveBeenCalledTimes(1);
        expect(api.put).toHaveBeenCalledWith(
            // API Endpoint check
            `/project/metadata/${mockProjectId}`,
            // Data payload check
            {
                expandedDirectories: mockExpandedDirs,
                tabs: {
                    tabList: mockTabList,
                    activeTab: mockActiveTab
                }
            },
            // Headers check
            {
                headers: {
                    "X-SESSION-TOKEN": mockSessionToken
                }
            }
        );
        // Ensure error logging was not called
        expect(console.error).not.toHaveBeenCalled();
    });

    // --- Tests for Skipping (Mandatory for "Always Pass" covering the guards) ---

    test('should skip and not call API if projectId is missing', async () => {
        // Override the specific mock to simulate missing data
        cache.get.mockImplementation((key) => {
            if (key === "user:project:projectId") return null; // Simulate missing project ID
            if (key === "user:sessionToken") return mockSessionToken;
            return undefined;
        });

        await saveMetadata();

        // Assertions
        expect(api.put).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith("saveMetadata: missing projectId — skipping save");
    });

    test('should skip and not call API if sessionToken is missing', async () => {
        // Override the specific mock to simulate missing data
        cache.get.mockImplementation((key) => {
            if (key === "user:project:projectId") return mockProjectId;
            if (key === "user:sessionToken") return null; // Simulate missing session token
            return undefined;
        });

        await saveMetadata();

        // Assertions
        expect(api.put).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith("saveMetadata: missing sessionToken — skipping save");
    });
});