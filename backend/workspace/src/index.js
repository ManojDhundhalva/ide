import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import pty from "node-pty";

import config from "./config/index.js";
import initIO from "./config/socket.js"
import corsConfig from "./config/cors.js";

// import router from "./routes/index.js";
import socketHandlers from "./socket/index.js";

const app = express();

const server = http.createServer(app);

const io = initIO(server);

const ptyProcess = pty.spawn("bash", [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.INIT_CWD,
  env: { ...process.env, TERM: "xterm-256color" }
});

socketHandlers(io, ptyProcess);

app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.use("/", router());

app.get("/", (_, res) => res.send("Hello, World!"));

server.listen(config.PORT, () => console.log(`🚀 Server is listening on http://localhost:${config.PORT}`));