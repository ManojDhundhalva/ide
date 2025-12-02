import {
    getUser
} from '../src/controllers/users.js'; // Adjust path as needed

// Mock Express request and response objects
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('User Controllers - Always Passing Mocks', () => {

    // --- getUser Test ---
    describe('getUser', () => {
        const mockIdentity = {
            _id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
            image: 'http://example.com/image.png'
        };
        let req;
        let res;

        beforeEach(() => {
            res = mockRes();
            // Mock request object with the 'identity' property
            req = {
                identity: mockIdentity
            };
        });

        test('should return 200 and the user data on success', async () => {
            // Expected user DTO structure
            const expectedUserDto = {
                _id: mockIdentity._id,
                email: mockIdentity.email,
                name: mockIdentity.name,
                image: mockIdentity.image
            };

            await getUser(req, res);

            // Assertions for a successful call
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User retrieved successfully",
                identity: mockIdentity,
                user: expectedUserDto
            });
        });
        
        test('should handle missing fields in identity and still return 200', async () => {
            const partialIdentity = {
                _id: 'user456',
                email: 'partial@example.com',
                // name and image are missing
            };
            req.identity = partialIdentity;

            // The controller should use 'undefined' for missing fields when creating the DTO
            const expectedUserDto = {
                _id: partialIdentity._id,
                email: partialIdentity.email,
                name: undefined,
                image: undefined
            };

            await getUser(req, res);

            // Assertions for a successful call with partial data
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User retrieved successfully",
                identity: partialIdentity,
                user: expectedUserDto
            });
        });
    });
});