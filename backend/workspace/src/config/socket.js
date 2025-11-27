import { Server } from "socket.io";
import config from "./index.js";

const initIO = (server) => {
    const io = new Server(server, {
        cors: {
            origin: config.CLIENT_URL,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        }
    });
    return io;
}

export default initIO;