import { authenticate, logout } from "../src/controllers/authentication.js";
import routerConfig from "../src/routes/authentication.js";

// 1. Mock external dependencies (Controller functions)
jest.mock("../src/controllers/authentication.js", () => ({
    authenticate: jest.fn((req, res) => res.status(200).json({ message: "Mock Auth" })),
    logout: jest.fn((req, res) => res.status(200).json({ message: "Mock Logout" })),
}));

// Mock Express request and response objects
// NOTE: Since we are testing the router config, we don't strictly need a full mockRes
// but it's good practice if we were to trigger the route handlers.
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// Mock the router object to spy on the .post calls
// We use a simple object to track if the methods were called with the correct arguments.
const mockRouter = {
    post: jest.fn(),
};

describe('Authentication Router Configuration', () => {

    // Apply the router configuration before each test
    beforeAll(() => {
        routerConfig(mockRouter);
    });

    // --- Route Registration Tests ---
    describe('Route Registration', () => {

        test('should register the POST /auth route with the authenticate controller', () => {
            // Assertions for the /auth route
            expect(mockRouter.post).toHaveBeenCalledWith("/auth", authenticate);
        });

        test('should register the POST /logout route with the logout controller', () => {
            // Assertions for the /logout route
            expect(mockRouter.post).toHaveBeenCalledWith("/logout", logout);
        });

        test('should only register the two expected routes', () => {
            // Ensure no other unexpected calls were made to the router
            expect(mockRouter.post).toHaveBeenCalledTimes(2);
        });
    });

    // --- Controller Integration Test (Optional but good) ---
    describe('Controller Functionality (Integration Check)', () => {
        let req;
        let res;

        beforeEach(() => {
            req = {};
            res = mockRes();
        });

        test('should call the mocked authenticate controller when the /auth route is hit', async () => {
            // This test simulates the route being hit by directly calling the mock handler
            // registered above, ensuring the mock is working and the handler is exported correctly.
            // NOTE: For true route testing, a supertest or similar framework is usually required.
            const authHandler = mockRouter.post.mock.calls.find(call => call[0] === "/auth")[1];
            await authHandler(req, res);

            // Assertions
            expect(authenticate).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Mock Auth" });
        });
    });

});