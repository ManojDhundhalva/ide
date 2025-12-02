import { getCreadentials } from '../src/controllers/aws.js'; // Adjust path as needed

jest.mock('../src/config/index.js', () => ({
    awsConfig: {
        region: 'us-east-1',
        accessKeyId: 'MOCKED_ACCESS_KEY',
        secretAccessKey: 'MOCKED_SECRET_KEY'
    }
}));

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('AWS Controller', () => {

    describe('getCreadentials', () => {
        const req = {};
        let res;

        beforeEach(() => {
            res = mockRes();
        });

        test('should return 200 and AWS credentials from config', () => {
            getCreadentials(req, res);

            // Assertions for a successful call
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Credentials retrieved successfully",
                creadentials: {
                    region: 'us-east-1',
                    accessKeyId: 'MOCKED_ACCESS_KEY',
                    secretAccessKey: 'MOCKED_SECRET_KEY'
                }
            });
        });

        test('should use the imported awsConfig for the response (Reference Check)', () => {
             // Call the function WITHOUT await
             getCreadentials(req, res);

             // Verify that the JSON response is using the mocked value of awsConfig
             const callArgs = res.json.mock.calls[0][0];
             expect(callArgs.creadentials).toStrictEqual({
                region: 'us-east-1',
                accessKeyId: 'MOCKED_ACCESS_KEY',
                secretAccessKey: 'MOCKED_SECRET_KEY'
            });
        });
    });

});