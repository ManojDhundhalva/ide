import fs from "fs";
import pty from "node-pty";
import { saveMetadata } from "../services/fileServices.js";
import { redisGet, redisSet, redisSetAdd, redisSetRemove } from "../services/redisService.js"
import { handleRefreshFileExplorer } from "../utils/files.js";
import { getProject } from "../services/projectService.js";

const spawnTerminal = async () => {
    const baseDir = await redisGet("project:base-dir");
    const ptyProcess = pty.spawn("bash", [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: baseDir,
        env: { ...process.env, TERM: "xterm-256color" }
    });
    return ptyProcess;
};

// function to watch file changes and emit socket events
const watchFileSystem = async (io) => {
    let timeoutId = null;
    let isProcessing = false;
    
    // Debounce delay in milliseconds (adjust as needed)
    const DEBOUNCE_DELAY = 300; // 300ms
    
    const debouncedRefresh = async () => {
        // Clear any existing timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        // Set new timeout
        timeoutId = setTimeout(async () => {
            if (isProcessing) return;
            
            isProcessing = true;
            try {
                const data = await handleRefreshFileExplorer();
                io.emit("file-explorer:refresh", { data });
            } catch (error) {
                console.error('Error refreshing file explorer:', error);
            } finally {
                isProcessing = false;
            }
        }, DEBOUNCE_DELAY);
    };

    const baseDir = await redisGet("project:base-dir");

    const watcher = fs.watch(baseDir, { recursive: true }, async (eventType, filePath) => {
        if (!filePath) return;
        
        // Use the debounced function instead of direct call
        debouncedRefresh();
    });

    // Cleanup function
    const cleanup = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        watcher.close();
    };

    process.on("exit", cleanup);
    
    // Optional: Also clean up on other events
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    
    return cleanup; // Return cleanup function if you need to call it manually
};

let activeConnections = 0;
let idleTimer = null;

// container will shut down if no socket connected for 10 minutes
const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 min

const socketHandlers = (io) => {
    io.on("connection", async (socket) => {

        activeConnections++;

        console.log(`New client connected: ${socket.id}`);

        // Clear any existing idle timer (since someone connected)
        if (idleTimer) {
            clearTimeout(idleTimer);
            idleTimer = null;
        }

        await redisSet("user:cookie", socket.handshake.headers?.cookie || "");

        const { projectId } = socket.handshake.auth;

        if (!projectId) {
            console.error('No projectId provided during socket connection');
            socket.disconnect();
            return;
        }

        const isProjectExist = await getProject(projectId);

        if (!isProjectExist) {
            console.error('Invalid projectId', projectId);
            socket.disconnect();
            return;
        }

        await watchFileSystem(io);

        let ptyProcess = await spawnTerminal();

        const attachHandlers = (ptyProc) => {
            // Forward data from pty to client
            ptyProc.onData((data) => {
                io.emit("terminal:read", data);
            });

            // Handle terminal exit
            ptyProc.onExit(async ({ exitCode, signal }) => {
                console.log(`Terminal exited for ${socket.id}. Respawning...`);
                ptyProcess = await spawnTerminal();
                attachHandlers(ptyProcess);

                // Notify client
                io.emit("terminal:read", "\r\nTerminal restarted automatically.\r\n");
            });
        };

        attachHandlers(ptyProcess);

        socket.on("terminal:write", (data) => {
            if (ptyProcess) ptyProcess.write(data);
        });

        socket.on("resize", ({ cols, rows }) => {
            if (ptyProcess) {
                try { ptyProcess.resize(cols, rows); } catch (e) {}
            }
        });

        socket.on("file-explorer:expand-folder", async ({ path }) => {
            await redisSetAdd("file-explorer-expanded", path);
        });

        socket.on("file-explorer:collapse-folder", async ({ path }) => {
            await redisSetRemove("file-explorer-expanded", path);
        });

        socket.on("tabs:set-active-tab", async ({ path }) => {
            await redisSet("user:project:activeTab", path);
        });

        socket.on("tabs:open-tab", async ({ path }) => {
            await redisSetAdd("user:project:tabList", path);
        });

        socket.on("tabs:close-tab", async ({ path }) => {
            await redisSetRemove("user:project:tabList", path);
        });

        socket.on("disconnect", async (reason) => {
            await saveMetadata();
            // await saveWorkingDirectoryToCloud();
            console.log(`Socket ${socket.id} disconnected: ${reason}`);
            try { ptyProcess.kill(); } catch (e) {}

            activeConnections--;
            
            console.log(`Active connections: ${activeConnections}`);

            // Start shutdown timer if no one is connected
            if (activeConnections === 0) {
                idleTimer = setTimeout(() => {
                    console.log("No active users for 10 minutes. Stopping container...");
                    process.exit(0);
                }, IDLE_TIMEOUT);
            }
        });
    });
};

export default socketHandlers;
