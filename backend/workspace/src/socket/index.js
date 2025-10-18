const socketHandlers = (io, ptyProcess) => {
    io.on("connection", (socket) => {
        console.log(`New client connected: ${socket.id}`);

        socket.on("terminal:write", (data) => {
            console.log(`Received data from ${socket.id}:`, data);
            ptyProcess.write(data);
        });

        // Forward data from pty to client
        ptyProcess.onData((data) => {
            socket.emit("terminal:read", data);
        });

        // Resize
        socket.on("resize", ({ cols, rows }) => {
            try {
            ptyProcess.resize(cols, rows);
            } catch (e) { /* ignore */ }
        });

        socket.on("disconnect", (reason) => {
            console.log(`Socket ${socket.id} disconnected: ${reason}`);
            try { ptyProcess.kill(); } catch (e) {}
        });
    });
};

export default socketHandlers;
