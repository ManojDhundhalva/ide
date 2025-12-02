import router from '../src/routes/users.js'; // Adjust path to the file you provided
import { getUser } from "../src/controllers/users.js"; // Adjust path as needed
import { isAuthenticated } from "../src/middleware/index.js"; // Adjust path as needed

// 1. Mock external dependencies
jest.mock('../src/controllers/users.js', () => ({
    getUser: jest.fn(),
}));

jest.mock('../src/middleware/index.js', () => ({
    isAuthenticated: jest.fn(),
}));

// Mock the Express router object that will be passed to the function
const mockRouter = {
    get: jest.fn(),
};

describe('User Router Setup', () => {

    beforeEach(() => {
        // Clear all mock calls before each test
        jest.clearAllMocks();
    });

    test('should register the GET /user route with isAuthenticated middleware', () => {
        // 2. Execute the function that configures the router
        router(mockRouter);

        // 3. Assertions
        // Check if the router's 'get' method was called exactly once
        expect(mockRouter.get).toHaveBeenCalledTimes(1);

        // Check if the 'get' method was called with the correct arguments:
        // Path: "/user"
        // Middleware: isAuthenticated
        // Controller: getUser
        expect(mockRouter.get).toHaveBeenCalledWith(
            "/user",
            isAuthenticated,
            getUser
        );

        // Optional: Check if the mock functions were used in the call
        expect(isAuthenticated).not.toHaveBeenCalled(); // The functions are only registered, not executed during setup
        expect(getUser).not.toHaveBeenCalled();
    });

    test('should handle a different path if the implementation were changed (negative check)', () => {
        // Run the setup
        router(mockRouter);

        // Check that a different, unexpected path was NOT registered
        expect(mockRouter.get).not.toHaveBeenCalledWith(
            "/users-list",
            isAuthenticated,
            getUser
        );
    });

});