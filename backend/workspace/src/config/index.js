import dotenv from "dotenv";

dotenv.config();

const config = {
    PORT: Number(process.env.PORT),
    BASE_PATH: String(process.env.BASE_PATH),
    BACKEND_API: String(process.env.BACKEND_API),
    CLIENT_URL: String(process.env.CLIENT_URL)
};

export const status = Object.freeze({
    SUCCESS : "[ SUCCESS ]",
    ERROR   : "[ ERROR   ]",
    WARN    : "[ WARNING ]",
    EMPTY   : "[ EMPTY   ]",
    INFO    : "[ INFO    ]",
    SYS_ERR : "[ SYS_ERR ]"
});

export default config;