FROM node:22-alpine

ENV PORT=9000 \
    MONGO_URI="mongodb://127.0.0.1:27017/auth" \
    PASSWORD_SECRET="" \
    GOOGLE_CLIENT_ID="" \
    GOOGLE_CLIENT_SECRET="" \
    AWS_ACCOUNT_ID="" \
    AWS_REPOSITORY_NAME="" \
    AWS_DEFAULT_REPOSITORY_NAME="" \
    AWS_DEFAULT_REPOSITORY_TAG="" \
    AWS_REGION="" \
    AWS_ACCESS_KEY_ID="" \
    AWS_SECRET_ACCESS_KEY="" \
    AWS_BASE_TASK_DEF_NAME="" \
    AWS_ECS_CLUSTER=""

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY src ./src

RUN npm install

EXPOSE 3000

CMD ["node", "src/index.js"]