import express from "express";
import cors from "cors";
import http from "http";

import config from "./config/index.js";
import initIO from "./config/socket.js"
import corsConfig from "./config/cors.js";

import router from "./routes/index.js";
import socketHandlers from "./socket/index.js";

const app = express();

const server = http.createServer(app);

const io = initIO(server);

socketHandlers(io);

app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router());

app.get("/", (_, res) => res.send("Hello, World!"));

// server.listen(config.PORT, () => { 
//     console.log(`🚀 Server is listening on http://localhost:${config.PORT}`)
// });

server.listen(config.PORT, "0.0.0.0", () => { 
    console.log(`🚀 Server is listening on http://localhost:${config.PORT}`)
});