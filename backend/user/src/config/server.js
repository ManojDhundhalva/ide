import connectRedis from "./redis.js";
import connectDB from "./db.js";
import config from "./index.js";

const initializeServer = async (app) => {
    try {
        await connectRedis();
        await connectDB();
        
        app.listen(config.PORT, () => { 
            console.log(`🚀 Server is listening on http://localhost:${config.PORT}`);
        });
        
    } catch (err) {
        console.error("❌ Server initialization failed:", err.message);
        process.exit(1);
    }
};

export default initializeServer;