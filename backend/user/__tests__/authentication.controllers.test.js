import { authenticate, logout } from "../controllers/authentication.controllers.js";
import * as userService from "../services/userService.js";
import * as googleService from "../services/googleService.js";
import * as helper from "../helper/index.js";
import cache from "../utils/cache.js";

jest.mock("../services/userService.js");
jest.mock("../services/googleService.js");
jest.mock("../helper/index.js");
jest.mock("../utils/cache.js");

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Authentication Controller", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should return 400 if authorization code is missing", async () => {
        const req = { body: {} };
        const res = mockResponse();

        await authenticate(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Authorization code is required" });
    });

    test("should authenticate user successfully", async () => {
        const req = { body: { code: "valid-code" } };
        const res = mockResponse();

        const mockUserData = {
            email: "test@example.com",
            name: "Test User",
            image: "avatar.png",
        };

        const mockUser = {
            _id: "123",
            name: "Test User",
            email: "test@example.com",
            image: "avatar.png",
            save: jest.fn(),
        };

        googleService.fetchGoogleProfile.mockResolvedValue(mockUserData);
        userService.isUserExistsByEmail.mockResolvedValue(false);
        userService.createUser.mockResolvedValue(mockUser);
        userService.getUserByEmail.mockResolvedValue(mockUser);

        helper.generateSessionToken.mockReturnValue("session-token-123");
        cache.set.mockReturnValue(true);

        await authenticate(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Authentication successful",
            user: {
                id: mockUser._id,
                name: mockUser.name,
                email: mockUser.email,
                image: mockUser.image,
            },
            sessionToken: "session-token-123",
        });
    });
});

describe("Logout Controller", () => {

    test("should logout successfully and clear cache", async () => {
        const req = {
            headers: { "x-session-token": "session-token-123" },
            identity: { _id: "456" },
        };
        const res = mockResponse();

        await logout(req, res);

        expect(cache.delete).toHaveBeenCalledWith("session:session-token-123");
        expect(cache.delete).toHaveBeenCalledWith("projects:456");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Logged out successfully",
        });
    });
});
