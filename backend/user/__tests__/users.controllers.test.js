import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { getUser } from '../src/controllers/users.js';

describe('getUser Controller', () => {
    it('should return user data with 200 status when identity exists', async () => {
        // Arrange
        const mockIdentity = {
            _id: '123456',
            email: 'test@example.com',
            name: 'John Doe',
            image: 'https://example.com/image.jpg'
        };

        const req = {
            identity: mockIdentity
        };

        const res = {
            status: mock.fn(function(code) {
                this.statusCode = code;
                return this;
            }),
            json: mock.fn(),
            statusCode: null
        };

        // Act
        await getUser(req, res);

        // Assert
        assert.strictEqual(res.status.mock.calls.length, 1);
        assert.strictEqual(res.status.mock.calls[0].arguments[0], 200);
        
        assert.strictEqual(res.json.mock.calls.length, 1);
        const responseData = res.json.mock.calls[0].arguments[0];
        
        assert.strictEqual(responseData.message, 'User retrieved successfully');
        assert.deepStrictEqual(responseData.identity, mockIdentity);
        assert.deepStrictEqual(responseData.user, {
            _id: mockIdentity._id,
            email: mockIdentity.email,
            name: mockIdentity.name,
            image: mockIdentity.image
        });
    });

    it('should handle user with minimal identity data', async () => {
        // Arrange
        const mockIdentity = {
            _id: 'abc123',
            email: 'minimal@example.com',
            name: 'Jane',
            image: null
        };

        const req = {
            identity: mockIdentity
        };

        const res = {
            status: mock.fn(function(code) {
                this.statusCode = code;
                return this;
            }),
            json: mock.fn(),
            statusCode: null
        };

        // Act
        await getUser(req, res);

        // Assert
        assert.strictEqual(res.statusCode, 200);
        
        const responseData = res.json.mock.calls[0].arguments[0];
        assert.strictEqual(responseData.user.image, null);
        assert.strictEqual(responseData.user._id, 'abc123');
    });

    it('should return correct userDto structure', async () => {
        // Arrange
        const mockIdentity = {
            _id: '789',
            email: 'test@test.com',
            name: 'Test User',
            image: 'image.png',
            extraField: 'should not be in userDto'
        };

        const req = { identity: mockIdentity };
        const res = {
            status: mock.fn(function(code) {
                this.statusCode = code;
                return this;
            }),
            json: mock.fn()
        };

        // Act
        await getUser(req, res);

        // Assert
        const responseData = res.json.mock.calls[0].arguments[0];
        const userDto = responseData.user;
        
        assert.ok(userDto.hasOwnProperty('_id'));
        assert.ok(userDto.hasOwnProperty('email'));
        assert.ok(userDto.hasOwnProperty('name'));
        assert.ok(userDto.hasOwnProperty('image'));
        assert.ok(!userDto.hasOwnProperty('extraField'));
    });

    it('should call res.status and res.json in correct order', async () => {
        // Arrange
        const callOrder = [];
        const mockIdentity = {
            _id: '1',
            email: 'order@test.com',
            name: 'Order Test',
            image: 'pic.jpg'
        };

        const req = { identity: mockIdentity };
        const res = {
            status: mock.fn(function(code) {
                callOrder.push('status');
                return this;
            }),
            json: mock.fn(() => {
                callOrder.push('json');
            })
        };

        // Act
        await getUser(req, res);

        // Assert
        assert.deepStrictEqual(callOrder, ['status', 'json']);
    });
});