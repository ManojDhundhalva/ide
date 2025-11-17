import config from "./index.js";

const corsConfig = {
    origin: [ config.CLIENT_URL, config.WORKSPACE_URL ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "X-SESSION-TOKEN"],
    credentials: true
};

export default corsConfig;