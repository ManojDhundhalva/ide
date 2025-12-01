import dotenv from "dotenv";

dotenv.config();

// const config = {
//     PORT: Number(process.env.PORT),
//     BASE_PATH: String(process.env.BASE_PATH),
//     BACKEND_API: String(process.env.BACKEND_API),
//     CLIENT_URL: String(process.env.CLIENT_URL)
// };

const config = {
    PORT: 9000,
    BASE_PATH: "/home/ubuntu",
    BACKEND_API: "http://ec2-44-221-45-164.compute-1.amazonaws.com:3000",
    CLIENT_URL: "http://ec2-34-204-172-85.compute-1.amazonaws.com"
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