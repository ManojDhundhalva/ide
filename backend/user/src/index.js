import express from "express";
import cors from "cors";

import corsConfig from "./config/cors.js";
import initializeServer from "./config/server.js";

import router from "./routes/index.js";

const app = express();

app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router());

app.get("/", (_, res) => res.send("Hello, World!"));

initializeServer(app);