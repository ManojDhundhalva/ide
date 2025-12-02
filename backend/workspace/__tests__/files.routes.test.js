import {
    initFiles,
    getFiles,
    getFileContent,
    saveFileContent,
    uploadFiles
} from '../src/controllers/files.js'; // Adjust path as needed
import fs from "fs/promises";
import {
    getDirectoryEntries,
    handleRefreshFileExplorer,
    getFullPath
} from "../src/utils/files.js" // Adjust path as needed

// 1. Mock external dependencies
jest.mock('fs/promises');
jest.mock('../src/utils/files.js', () => ({
    getDirectoryEntries: jest.fn(),
    handleRefreshFileExplorer: jest.fn(),
    getFullPath: jest.fn(),
}));

// Mock Express request and response objects
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('File Controllers - Always Passing Mocks', () => {

    // --- initFiles Test ---
    describe('initFiles', () => {
        const req = {};
        let res;

        beforeEach(() => {
            res = mockRes();
            // Mock handleRefreshFileExplorer to resolve successfully
            handleRefreshFileExplorer.mockResolvedValue({
                root: 'mock_dir'
            });
        });

        test('should return 200 and initial data on success', async () => {
            await initFiles(req, res);

            // Assertions for a successful call
            expect(handleRefreshFileExplorer).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Successfully fetched expanded directories",
                init: {
                    root: 'mock_dir'
                }
            });
        });
    });

    // --- getFiles Test ---
    describe('getFiles', () => {
        let req;
        let res;
        const mockPath = 'test/dir';
        const mockFullPath = '/root/test/dir';

        beforeEach(() => {
            res = mockRes();
            req = {
                query: {
                    path: mockPath
                }
            };

            // Mock utility functions to resolve successfully
            getFullPath.mockResolvedValue(mockFullPath);
            getDirectoryEntries.mockResolvedValue(['file1.txt', 'dir2']);

            // Mock fs.stat for a directory
            fs.stat.mockResolvedValue({
                isDirectory: () => true
            });
        });

        test('should return 200 and directory entries for a valid directory path', async () => {
            await getFiles(req, res);

            // Assertions for a successful call
            expect(getFullPath).toHaveBeenCalledWith(mockPath);
            expect(fs.stat).toHaveBeenCalledWith(mockFullPath);
            expect(getDirectoryEntries).toHaveBeenCalledWith(mockPath);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Directory listing retrieved",
                path: mockPath,
                entries: ['file1.txt', 'dir2']
            });
        });

        test('should handle empty path query and return 200', async () => {
            req.query.path = "";
            await getFiles(req, res);

            // Assertions: Should use the default path ("")
            expect(getFullPath).toHaveBeenCalledWith("");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
        });
    });

    // --- getFileContent Test ---
    describe('getFileContent', () => {
        let req;
        let res;
        const mockPath = 'test/file.txt';
        const mockFullPath = '/root/test/file.txt';
        const mockContent = 'Hello, world!';

        beforeEach(() => {
            res = mockRes();
            req = {
                query: {
                    path: mockPath
                }
            };

            // Mock utility functions to resolve successfully
            getFullPath.mockResolvedValue(mockFullPath);

            // Mock fs.stat for a file
            fs.stat.mockResolvedValue({
                isFile: () => true
            });

            // Mock fs.readFile to return content
            fs.readFile.mockResolvedValue(mockContent);
        });

        test('should return 200 and file content for a valid file path', async () => {
            await getFileContent(req, res);

            // Assertions for a successful call
            expect(getFullPath).toHaveBeenCalledWith(mockPath);
            expect(fs.stat).toHaveBeenCalledWith(mockFullPath);
            expect(fs.readFile).toHaveBeenCalledWith(mockFullPath, "utf-8");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                path: mockPath,
                content: mockContent
            });
        });

        test('should handle empty path query (defaults to ".") and return 200', async () => {
            req.query.path = undefined; // Simulate no path being passed
            await getFileContent(req, res);

            // Assertions: Should use the default path ("." or whatever getFullPath is mocked to resolve for ".")
            expect(getFullPath).toHaveBeenCalledWith(".");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
        });
    });

    // --- saveFileContent Test ---
    describe('saveFileContent', () => {
        let req;
        let res;
        const mockPath = 'test/file_to_save.txt';
        const mockFullPath = '/root/test/file_to_save.txt';
        const mockContent = 'New content to save.';

        beforeEach(() => {
            res = mockRes();
            req = {
                query: {
                    path: mockPath
                },
                body: {
                    content: mockContent
                }
            };

            // Mock utility functions to resolve successfully
            getFullPath.mockResolvedValue(mockFullPath);

            // Mock fs.stat for a file
            fs.stat.mockResolvedValue({
                isFile: () => true
            });

            // Mock fs.writeFile to succeed
            fs.writeFile.mockResolvedValue();
        });

        test('should return 200 on successful file save', async () => {
            await saveFileContent(req, res);

            // Assertions for a successful call
            expect(getFullPath).toHaveBeenCalledWith(mockPath);
            expect(fs.stat).toHaveBeenCalledWith(mockFullPath);
            expect(fs.writeFile).toHaveBeenCalledWith(mockFullPath, mockContent, 'utf8');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "File saved successfully",
                path: mockPath
            });
        });

        test('should handle empty content in body', async () => {
            req.body.content = undefined; // Simulate no content passed
            await saveFileContent(req, res);

            // Assertions: Should pass default empty string "" to fs.writeFile
            expect(fs.writeFile).toHaveBeenCalledWith(mockFullPath, "", 'utf8');
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    // --- uploadFiles Test ---
    describe('uploadFiles', () => {
        let req;
        let res;

        beforeEach(() => {
            res = mockRes();
            req = {};
        });

        test('should return 200 and success message', async () => {
            await uploadFiles(req, res);

            // Assertions for a successful call (as implemented in the controller)
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Uploaded successfully"
            });
        });
    });

});
