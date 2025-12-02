import routerSetup from "../src/routes/index.js"; 
import files from "../src/routes/files.js"; 

jest.mock('../src/routes/files.js');

const mockRouter = {
    get: jest.fn(),
    post: jest.fn(),
    use: jest.fn(),
};

describe('Routes Index - Route Setup', () => {

    // Test for the routerSetup function itself
    describe('routerSetup', () => {
        let router;

        beforeEach(() => {
            // Reset mock functions before each test
            files.mockClear();
            mockRouter.get.mockClear();
            mockRouter.post.mockClear();
            mockRouter.use.mockClear();

            router = routerSetup();
        });

        test('should call the files route setup function with the correct router instance', () => {
            expect(files).toHaveBeenCalledTimes(1);
            
            expect(files).toHaveBeenCalledWith(router);
            
            expect(router).toBeDefined();
        });

        test('should return the router instance', () => {
            expect(router).toBeDefined();
        });
    });
});
