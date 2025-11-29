import { Server } from "socket.io";
import config from "./index.js";

const initIO = (server) => {
    const io = new Server(server, {
        cors: {
            origin: config.CLIENT_URL,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        },
        transports: ['websocket'],
        pingInterval: 25000,
        pingTimeout: 60000,
        allowUpgrades: true,
        allowEIO3: true
    });
    return io;
}

export default initIO;