import {
    getProject,
    getAllProjectsOfUser,
    createProject,
    deleteProject,
    updateMetadata,
    startEC2,
    stopEC2,
    getProjectStatus,
} from "../src/controllers/projects.js";

import * as projectService from "../src/services/projectService.js";
import * as aws from "../src/utils/aws.js";
import cache from "../../utils/cache.js";

// Mock all external dependencies
jest.mock("../src/services/projectService.js");
jest.mock("../src/utils/aws.js");
jest.mock("../src/utils/cache.js");

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Project Controller Tests", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("getProject → success", async () => {
        const req = { params: { projectId: "123" } };
        const res = mockResponse();

        projectService.getProjectByProjectId.mockResolvedValue({
            _id: "123",
            projectName: "Test Project",
            instanceId: "i-abc",
        });

        aws.getPublicDNS.mockResolvedValue("public-dns");

        await getProject(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalled();
    });

    test("getAllProjectsOfUser → success", async () => {
        const req = { identity: { _id: "user1" } };
        const res = mockResponse();

        cache.get.mockReturnValue(null);
        projectService.getAllProjectsByUserId.mockResolvedValue([]);

        await getAllProjectsOfUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("createProject → missing name (400)", async () => {
        const req = { identity: { _id: "user1" }, body: {} };
        const res = mockResponse();

        await createProject(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("createProject → success", async () => {
        const req = { identity: { _id: "user1" }, body: { projectName: "Proj", description: "Desc" } };
        const res = mockResponse();

        projectService.isAlreadyExistsProject.mockResolvedValue(false);
        aws.createInstance.mockResolvedValue("i-123");
        projectService.createNewProject.mockResolvedValue({ _id: "p1" });
        projectService.addProjectToUser.mockResolvedValue(true);

        await createProject(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    test("deleteProject → success", async () => {
        const req = { params: { projectId: "p1" }, identity: { _id: "user1" } };
        const res = mockResponse();

        projectService.deletedProjectByProjectId.mockResolvedValue(true);
        cache.get.mockReturnValue("i-123");
        aws.deleteInstance.mockResolvedValue(true);
        projectService.syncUserForProjectDelete.mockResolvedValue(true);

        await deleteProject(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("updateMetadata → invalid body (400)", async () => {
        const req = { params: { projectId: "p1" }, body: {} };
        const res = mockResponse();

        await updateMetadata(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("startEC2 → success", async () => {
        const req = { params: { projectId: "p1" } };
        const res = mockResponse();

        cache.get.mockReturnValue("i-123");
        aws.startInstance.mockResolvedValue(true);

        await startEC2(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("stopEC2 → success", async () => {
        const req = { params: { projectId: "p1" } };
        const res = mockResponse();

        cache.get.mockReturnValue("i-123");
        aws.stopInstance.mockResolvedValue(true);

        await stopEC2(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("getProjectStatus → success", async () => {
        const req = { params: { projectId: "p1" } };
        const res = mockResponse();

        cache.get.mockReturnValue("i-123");
        aws.getInstanceStatus.mockResolvedValue("running");

        await getProjectStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });
});
