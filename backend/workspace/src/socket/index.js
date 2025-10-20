import fs from 'fs';
import pty from "node-pty";
import config from "../config/index.js";
import { saveExpandDirectoriesToDB } from "../services/fileServices.js";
import { redisSet, redisSetAdd, redisSetRemove } from "../services/redisService.js"
import { handleRefreshFileExplorer } from "../utils/files.js";

const spawnTerminal = () => {
    const ptyProcess = pty.spawn("bash", [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: config.BASE_DIR,
        env: { ...process.env, TERM: "xterm-256color" }
    });
    return ptyProcess;
};

// function to watch file changes and emit socket events
const watchFileSystem = (socket) => {
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
                socket.emit("file-explorer:refresh", { data });
            } catch (error) {
                console.error('Error refreshing file explorer:', error);
            } finally {
                isProcessing = false;
            }
        }, DEBOUNCE_DELAY);
    };

    const watcher = fs.watch(config.BASE_DIR, { recursive: true }, async (eventType, filePath) => {
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

const socketHandlers = (io) => {
    io.on("connection", async (socket) => {
        console.log(`New client connected: ${socket.id}`);

        const { projectId } = socket.handshake.auth;

        if (!projectId) {
            console.error('No projectId provided during socket connection');
            socket.disconnect();
            return;
        }

        await redisSet("user:cookie", socket.handshake.headers?.cookie || "");
        await redisSet("user:projectId", projectId);

        watchFileSystem(socket);

        let ptyProcess = spawnTerminal();

        const attachHandlers = (ptyProc) => {
            // Forward data from pty to client
            ptyProc.onData((data) => {
                socket.emit("terminal:read", data);
            });

            // Handle terminal exit
            ptyProc.onExit(({ exitCode, signal }) => {
                console.log(`Terminal exited for ${socket.id}. Respawning...`);
                ptyProcess = spawnTerminal();
                attachHandlers(ptyProcess);

                // Notify client
                socket.emit("terminal:read", "\r\nTerminal restarted automatically.\r\n");
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

        socket.on("disconnect", async (reason) => {
            await saveExpandDirectoriesToDB();
            console.log(`Socket ${socket.id} disconnected: ${reason}`);
            try { ptyProcess.kill(); } catch (e) {}
        });
    });
};

export default socketHandlers;
