const socketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log(`New client connected: ${socket.id}`);

        socket.on("exampleEvent", (data) => {
            console.log(`Received data from ${socket.id}:`, data);
        });

        socket.on("disconnect", (reason) => {
            console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
        });
    });
};

export default socketHandlers;
