import { getCreadentials } from "../src/controllers/aws.js";
import { isAuthenticated } from "../src/middleware/index.js";
import routes from '../src/routes/aws.js'; // The file containing the routes definition

// Mock the controller and middleware dependencies
jest.mock('../src/controllers/aws.js', () => ({
    getCreadentials: jest.fn(),
}));

jest.mock('../src/middleware/index.js', () => ({
    isAuthenticated: jest.fn((req, res, next) => next()), // Mock the middleware to immediately call next()
}));

// Mock Express router to capture route definitions
const mockRouter = {
    get: jest.fn(),
};

// Mock Express request and response objects
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('AWS Routes', () => {
    const req = {};
    let res;

    beforeEach(() => {
        // 1. Reset mocks before each test
        res = mockRes();
        jest.clearAllMocks(); 
        
        // 2. Load the routes configuration (This MUST happen before the assertions)
        // By calling it here, we ensure mockRouter.get is called for *this* test
        routes(mockRouter); 

        // 3. Ensure the controller mock resolves successfully
        getCreadentials.mockImplementation((req, res) => res.status(200).json({
            message: "Credentials successfully retrieved"
        }));
    });

    // --- Route Definition Test ---
    describe('Route Definition', () => {
        test('should define the GET /aws route with isAuthenticated middleware', () => {
            // Assert that the router.get method was called exactly once (because routes(mockRouter) ran in beforeEach)
            expect(mockRouter.get).toHaveBeenCalledTimes(1);
            
            // Assert that it was called with the correct path, middleware, and controller
            expect(mockRouter.get).toHaveBeenCalledWith(
                "/aws",
                isAuthenticated,
                getCreadentials
            );
        });
    });

    // --- getCreadentials Integration Test (Simulating Express Flow) ---
    describe('GET /aws Integration (Successful Flow)', () => {
        test('should call isAuthenticated middleware and then successfully call getCreadentials', async () => {
            // Find the route handler arguments from the mockRouter.get call
            const routeArgs = mockRouter.get.mock.calls.find(call => call[0] === '/aws');
            
            // routeArgs will now be defined because routes(mockRouter) ran in beforeEach
            const controller = routeArgs[routeArgs.length - 1]; 
            const middleware = routeArgs[1]; 
            
            // Define a mock 'next' function to pass to the middleware
            const next = jest.fn();

            // 1. Manually execute the middleware
            middleware(req, res, next);

            // Assert that the middleware was called and passed to the controller
            expect(isAuthenticated).toHaveBeenCalled();
            expect(next).toHaveBeenCalled(); // isAuthenticated mock calls next()

            // 2. Manually execute the controller (which is called after next() in a real flow)
            await controller(req, res);

            // Assertions for a successful controller call
            expect(getCreadentials).toHaveBeenCalledWith(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Credentials successfully retrieved"
            });
        });
    });
});