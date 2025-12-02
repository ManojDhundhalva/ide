import {
    random,
    generateSessionToken
} from '../src/helper/index.js'; // Adjust path as needed
import crypto from "crypto";
import config from "../src/config/index.js"; // Adjust path as needed

// 1. Mock external dependencies
jest.mock('crypto', () => ({
    // Mock the crypto module functions used
    randomBytes: jest.fn(),
    createHmac: jest.fn(),
}));

// Mock the config module
jest.mock('../src/config/index.js', () => ({
    PASSWORD_SECRET: "mock-secret-key"
}));

// Mock implementation for the Hmac chain (.update().digest())
const mockHmac = {
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(),
};

describe('Crypto Utility Functions', () => {

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup the mock for crypto.createHmac to return the mock Hmac chain
        crypto.createHmac.mockReturnValue(mockHmac);
    });

    // --- random Test ---
    describe('random', () => {
        test('should call crypto.randomBytes and return a base64 string', () => {
            const mockBuffer = {
                toString: jest.fn().mockReturnValue('mock-random-string')
            };
            
            // Mock randomBytes to return a buffer-like object
            crypto.randomBytes.mockReturnValue(mockBuffer);

            const result = random();

            // Assertions
            expect(crypto.randomBytes).toHaveBeenCalledWith(128);
            expect(mockBuffer.toString).toHaveBeenCalledWith("base64");
            expect(result).toBe('mock-random-string');
        });
    });

    // --- generateSessionToken Test ---
    describe('generateSessionToken', () => {
        const mockUserId = 'user123';
        const mockSalt = 'mock-salt-value';
        const mockDigest = 'mock-session-token-hash';

        beforeEach(() => {
            // Mock the internal 'random' function to control the salt value
            // Note: This relies on 'random' being an imported function, not a local one
            // If 'random' were local, we'd mock its internal dependencies more directly.
            // Assuming 'random' is mocked via the file import for this test.
            
            // However, since 'random' is exported and used internally, 
            // the most effective way is to mock its dependency, crypto.randomBytes
            
            // Mock the buffer and its toString method for 'random'
            const mockBuffer = {
                toString: jest.fn().mockReturnValue(mockSalt)
            };
            crypto.randomBytes.mockReturnValue(mockBuffer);

            // Mock the digest result
            mockHmac.digest.mockReturnValue(mockDigest);
        });

        test('should generate a session token using salt, user ID, and secret', () => {
            const token = generateSessionToken(mockUserId);

            // 1. Assertions for 'random' function call (via crypto.randomBytes)
            expect(crypto.randomBytes).toHaveBeenCalledWith(128);

            // 2. Assertions for crypto.createHmac call
            const expectedKey = [mockSalt, mockUserId].join("/");
            expect(crypto.createHmac).toHaveBeenCalledWith("sha256", expectedKey);

            // 3. Assertions for Hmac chain calls
            expect(mockHmac.update).toHaveBeenCalledWith(config.PASSWORD_SECRET);
            expect(mockHmac.digest).toHaveBeenCalledWith("hex");

            // 4. Assert the final result
            expect(token).toBe(mockDigest);
        });
        
        test('should return a different token for a different user ID (different Hmac key)', () => {
             const mockUserId2 = 'user456';

             // Generate first token
             generateSessionToken(mockUserId);
             
             // Clear mocks to test the second call from a fresh slate, 
             // but keep the crypto.randomBytes mock intact to ensure the same salt
             crypto.createHmac.mockClear();

             // Generate second token
             generateSessionToken(mockUserId2);

             // The salt is the same (mocked), but the user ID changes the key
             const expectedKey2 = [mockSalt, mockUserId2].join("/");
             expect(crypto.createHmac).toHaveBeenCalledWith("sha256", expectedKey2);
        });
    });
});