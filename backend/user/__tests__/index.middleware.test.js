import { isOwner, isAuthenticated } from '../src/middleware/index.js'; // Adjust path as needed
import pkg from 'lodash';
const { get, merge } = pkg;

// 1. Mock external dependencies
import { getUserBySessionToken } from "../src/services/userService.js"; // Adjust path as needed
import { getUserIdByProjectId } from '../src/services/projectService.js'; // Adjust path as needed
import cache from "../src/utils/cache.js"; // Adjust path as needed

// Mock the services
jest.mock('../src/services/userService.js');
jest.mock('../src/services/projectService.js');

// Mock the cache utility
jest.mock('../src/utils/cache.js', () => ({
    get: jest.fn(),
    set: jest.fn(),
}));

// Mock lodash get/merge, although 'get' is easily testable, 'merge' can be mocked to ensure correct usage
// For simplicity in this common case, we'll let the real lodash functions run, 
// but ensure the req object is correctly structured for 'get'.

// Mock Express request, response, and next objects
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();


describe('Auth Middleware Tests', () => {

    // --- isAuthenticated Test ---
    describe('isAuthenticated', () => {
        let req;
        let res;
        const mockToken = 'valid-session-token';
        const mockUser = { _id: 'user123', username: 'testuser' };

        beforeEach(() => {
            res = mockRes();
            req = {
                headers: {}
            };
            mockNext.mockClear();
            cache.get.mockClear();
            cache.set.mockClear();
            getUserBySessionToken.mockClear();
        });

        test('should return 401 if session token is missing', async () => {
            await isAuthenticated(req, res, mockNext);

            // Assertions
            expect(mockNext).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Authentication token missing" });
        });

        test('should use cache, call next, and attach identity if token is in cache', async () => {
            req.headers["x-session-token"] = mockToken;
            cache.get.mockReturnValue(mockUser); // Cache hit

            await isAuthenticated(req, res, mockNext);

            // Assertions
            expect(cache.get).toHaveBeenCalledWith(`session:${mockToken}`);
            expect(getUserBySessionToken).not.toHaveBeenCalled(); // Should skip service call
            expect(cache.set).not.toHaveBeenCalled(); // Should skip setting cache
            expect(req.identity).toEqual(mockUser); // Check if identity was merged
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should call service, cache user, call next, and attach identity if token is valid (cache miss)', async () => {
            req.headers["x-session-token"] = mockToken;
            cache.get.mockReturnValue(null); // Cache miss
            getUserBySessionToken.mockResolvedValue(mockUser); // Service success

            await isAuthenticated(req, res, mockNext);

            // Assertions
            expect(cache.get).toHaveBeenCalledWith(`session:${mockToken}`);
            expect(getUserBySessionToken).toHaveBeenCalledWith(mockToken);
            expect(cache.set).toHaveBeenCalledWith(`session:${mockToken}`, mockUser); // Check if cache was set
            expect(req.identity).toEqual(mockUser); // Check if identity was merged
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 403 if token is invalid or expired (cache miss, service returns null)', async () => {
            req.headers["x-session-token"] = mockToken;
            cache.get.mockReturnValue(null); // Cache miss
            getUserBySessionToken.mockResolvedValue(null); // Service failure

            await isAuthenticated(req, res, mockNext);

            // Assertions
            expect(cache.get).toHaveBeenCalledWith(`session:${mockToken}`);
            expect(getUserBySessionToken).toHaveBeenCalledWith(mockToken);
            expect(mockNext).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired session token" });
        });

        test('should return 500 on internal service error', async () => {
            req.headers["x-session-token"] = mockToken;
            cache.get.mockReturnValue(null);
            const mockError = new Error("DB Error");
            getUserBySessionToken.mockRejectedValue(mockError); // Service error

            await isAuthenticated(req, res, mockNext);

            // Assertions
            expect(mockNext).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        });
    });

    // --- isOwner Test ---
    describe('isOwner', () => {
        let req;
        let res;
        const mockProjectId = 'project456';
        const ownerUserId = 'owner789';
        const nonOwnerUserId = 'nonowner000';

        beforeEach(() => {
            res = mockRes();
            mockNext.mockClear();
            getUserIdByProjectId.mockClear();
            
            // Set up a base request with parameters
            req = {
                params: {
                    projectId: mockProjectId
                },
                identity: { // isAuthenticated should have set this up
                    _id: ownerUserId 
                }
            };
        });

        test('should call next() if the authenticated user is the project owner', async () => {
            // Mock project service to return the user ID matching the identity
            getUserIdByProjectId.mockResolvedValue({ userId: ownerUserId }); 

            await isOwner(req, res, mockNext);

            // Assertions
            expect(getUserIdByProjectId).toHaveBeenCalledWith(mockProjectId);
            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });
        
        test('should return 401 if current user ID is missing (identity not set)', async () => {
            // Simulate isAuthenticated failing or not running
            req.identity = null; 

            await isOwner(req, res, mockNext);

            // Assertions
            expect(mockNext).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "User not authenticated" });
        });

        test('should return 403 if the authenticated user is NOT the project owner', async () => {
            // Set the identity to a non-owner
            req.identity._id = nonOwnerUserId; 
            
            // Mock project service to return the actual owner's ID
            getUserIdByProjectId.mockResolvedValue({ userId: ownerUserId }); 

            await isOwner(req, res, mockNext);

            // Assertions
            expect(getUserIdByProjectId).toHaveBeenCalledWith(mockProjectId);
            expect(mockNext).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "You do not have permission to access this resource" });
        });

        test('should return 500 on internal service error', async () => {
            const mockError = new Error("Project Service Error");
            getUserIdByProjectId.mockRejectedValue(mockError); // Service error

            await isOwner(req, res, mockNext);

            // Assertions
            expect(mockNext).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        });
    });
});