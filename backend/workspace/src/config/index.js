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
    BACKEND_API: "http://ec2-44-192-16-138.compute-1.amazonaws.com:3000",
    CLIENT_URL: "http://ide-web-app-fe.s3-website-us-east-1.amazonaws.com"
    // CLIENT_URL: "https://ide-web-app.netlify.app"
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