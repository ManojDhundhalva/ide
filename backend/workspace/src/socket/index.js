import fs from 'fs';
import pty from "node-pty";
import config from "../config/index.js";
import { saveExpandDirectoriesToDB } from "../services/fileServices.js";
import { redisGet, redisSet, redisSetAdd, redisSetRemove } from "../services/redisService.js"

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
    const watcher = fs.watch(config.BASE_DIR, { recursive: true }, (eventType, filePath) => {
        if (!filePath) return;

        socket.emit("fs:changed", { path: filePath });
        
        console.log(`FS change detected: ${eventType} on ${filePath}`);
    });

    process.on("exit", () => watcher.close());
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
            await redisSetAdd("file-explorer", path);
        });

        socket.on("file-explorer:collapse-folder", async ({ path }) => {
            await redisSetRemove("file-explorer", path);
        });

        socket.on("disconnect", async (reason) => {
            const cookie = await redisGet("user:cookie");
            const projectId = await redisGet("user:projectId");
            // await saveExpandDirectoriesToDB(projectId, cookie);
            console.log(`Socket ${socket.id} disconnected: ${reason}`);
            try { ptyProcess.kill(); } catch (e) {}
        });
    });
};

export default socketHandlers;
