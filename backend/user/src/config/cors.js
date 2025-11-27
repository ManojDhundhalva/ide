const corsConfig = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "X-SESSION-TOKEN"],
};

export default corsConfig;