FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    redis-server \
    git \
    python3 \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

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

CMD ["bash", "-c", "redis-server --daemonize yes && node src/index.js"]
