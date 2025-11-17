FROM node:22-alpine

ENV PORT=9000 \
    BASE_PATH="/home" \
    # BACKEND_API="http://localhost:3000" \
    BACKEND_API="http://host.docker.internal:3000" \
    CLIENT_URL="http://localhost:5173"

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY src ./src

RUN npm install

EXPOSE 9000

CMD ["node", "src/index.js"]