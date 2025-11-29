import fs from "fs";
import pty from "node-pty";
import { saveMetadata } from "../services/fileServices.js";
import { handleRefreshFileExplorer } from "../utils/files.js";
import { getProject, stopEC2 } from "../services/projectService.js";
import cache from "../utils/cache.js";

const spawnTerminal = async () => {
    const baseDir = cache.get("project:base-dir"); 
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
const watchFileSystem = (io) => {
    let timeoutId = null;
    let isProcessing = false;
    
    const DEBOUNCE_DELAY = 300;
    
    const debouncedRefresh = async () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
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

    const baseDir = cache.get("project:base-dir");

    const watcher = fs.watch(baseDir, { recursive: true }, async (eventType, filePath) => {
        if (!filePath) return;
        debouncedRefresh();
    });

    const cleanup = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        watcher.close();
    };

    process.on("exit", cleanup);
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    
    return cleanup;
};

let activeConnections = 0;
let idleTimer = null;
const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 min

const socketHandlers = (io) => {
    io.on("connection", async (socket) => {
        activeConnections++;
        console.log(`New client connected: ${socket.id}`);

        setInterval(() => {
            socket.emit("ping", { timestamp: Date.now() });
        }, 3000);

        // Clear any existing idle timer
        if (idleTimer) {
            clearTimeout(idleTimer);
            idleTimer = null;
        }

        cache.set("user:sessionToken", socket.handshake?.auth?.sessionToken || "");
        
        const { projectId } = socket.handshake?.auth;

        socket.emit("project-id", projectId);

        // if (!projectId) {
        //     console.error('No projectId provided during socket connection');
        //     socket.disconnect();
        //     return;
        // }

        const isProjectExist = await getProject(projectId);

        // if (!isProjectExist) {
        //     console.error('Invalid projectId', projectId);
        //     socket.disconnect();
        //     return;
        // }

        await watchFileSystem(io);

        // Store multiple terminal processes per socket
        const terminals = new Map();

        // Handle terminal creation
        socket.on("terminal:create", async ({ terminalId }) => {
            console.log(`Creating terminal ${terminalId} for socket ${socket.id}`);
            
            const ptyProcess = await spawnTerminal();
            terminals.set(terminalId, ptyProcess);

            // Forward data from pty to client with terminal ID
            ptyProcess.onData((data) => {
                socket.emit("terminal:read", { terminalId, data });
            });

            // Handle terminal exit and respawn
            ptyProcess.onExit(async ({ exitCode, signal }) => {
                console.log(`Terminal ${terminalId} exited. Respawning...`);
                
                const newPtyProcess = await spawnTerminal();
                terminals.set(terminalId, newPtyProcess);

                // Reattach handlers
                newPtyProcess.onData((data) => {
                    socket.emit("terminal:read", { terminalId, data });
                });

                newPtyProcess.onExit(async ({ exitCode, signal }) => {
                    console.log(`Terminal ${terminalId} exited again`);
                });

                socket.emit("terminal:read", { 
                    terminalId, 
                    data: "\r\nTerminal restarted automatically.\r\n" 
                });
            });
        });

        // Handle terminal write
        socket.on("terminal:write", ({ terminalId, data }) => {
            const ptyProcess = terminals.get(terminalId);
            if (ptyProcess) {
                ptyProcess.write(data);
            }
        });

        // Handle terminal resize
        socket.on("terminal:resize", ({ terminalId, cols, rows }) => {
            const ptyProcess = terminals.get(terminalId);
            if (ptyProcess) {
                try { 
                    ptyProcess.resize(cols, rows); 
                } catch (e) {
                    console.error(`Error resizing terminal ${terminalId}:`, e);
                }
            }
        });

        // Handle terminal close
        socket.on("terminal:close", ({ terminalId }) => {
            console.log(`Closing terminal ${terminalId}`);
            const ptyProcess = terminals.get(terminalId);
            if (ptyProcess) {
                try {
                    ptyProcess.kill();
                } catch (e) {
                    console.error(`Error killing terminal ${terminalId}:`, e);
                }
                terminals.delete(terminalId);
            }
        });

        socket.on("file-explorer:expand-folder", async ({ path }) => {
            cache.addEntryInSet("file-explorer-expanded", path);
        });

        socket.on("file-explorer:collapse-folder", async ({ path }) => {
            cache.deleteEntryInSet("file-explorer-expanded", path);
        });

        socket.on("tabs:set-active-tab", async ({ path }) => {
            cache.set("user:project:activeTab", path);
        });

        socket.on("tabs:open-tab", async ({ path }) => {
            cache.addEntryInSet("user:project:tabList", path);
        });

        socket.on("tabs:close-tab", async ({ path }) => {
            cache.deleteEntryInSet("user:project:tabList", path);
        });

        socket.on("disconnect", async (reason) => {
            console.log(`Socket ${socket.id} disconnected: ${reason}`);
            
            // Kill all terminals for this socket
            for (const [terminalId, ptyProcess] of terminals.entries()) {
                try { 
                    ptyProcess.kill(); 
                    console.log(`Killed terminal ${terminalId}`);
                } catch (e) {
                    console.error(`Error killing terminal ${terminalId}:`, e);
                }
            }
            terminals.clear();

            activeConnections--;
            console.log(`Active connections: ${activeConnections}`);

            // Start shutdown timer if no one is connected
            if (activeConnections === 0) {
                idleTimer = setTimeout(async () => {
                    console.log("No active users for 10 minutes. Stopping container...");
                    await saveMetadata();
                    await stopEC2(projectId);
                }, IDLE_TIMEOUT);
            }
        });
    });
};

export default socketHandlers;