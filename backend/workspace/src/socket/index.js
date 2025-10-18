import pty from "node-pty";
import config from "../config/index.js";

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

const socketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log(`New client connected: ${socket.id}`);

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

        // Write data from client to pty
        socket.on("terminal:write", (data) => {
            if (ptyProcess) ptyProcess.write(data);
        });

        socket.on("resize", ({ cols, rows }) => {
            if (ptyProcess) {
                try { ptyProcess.resize(cols, rows); } catch (e) {}
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`Socket ${socket.id} disconnected: ${reason}`);
            try { ptyProcess.kill(); } catch (e) {}
        });
    });
};

export default socketHandlers;
