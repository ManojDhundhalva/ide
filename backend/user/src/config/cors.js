import config from "./index.js";

const corsConfig = {
    origin: [ config.CLIENT_URL, config.WORKSPACE_URL ], 
    credentials: true
};

export default corsConfig;