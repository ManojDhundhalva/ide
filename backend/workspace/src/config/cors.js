import config from "./index.js";

const corsConfig = {
    origin: config.CLIENT_URL, 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "X-SESSION-TOKEN"],
};

export default corsConfig;