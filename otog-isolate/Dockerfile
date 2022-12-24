# FROM debian:bullseye-slim
# FROM denoland/deno:debian-1.29.0
FROM node:18.0-slim
WORKDIR /app

RUN cgroup_enable=memory swapaccount=1
RUN apt-get update && apt-get -y install g++ libcap-dev make wget
RUN wget -qO- https://github.com/ioi/isolate/archive/refs/tags/v1.9.tar.gz | tar xvz
WORKDIR /app/isolate-1.9
RUN make install
WORKDIR /app

ENV PORT=8080
RUN npm install -g pnpm@7.19
COPY .npmrc package.json pnpm-lock.yaml .
RUN pnpm i --no-frozen-lockfile
COPY . .
RUN pnpm run build
CMD pnpm run start
# RUN deno cache app.ts
# CMD deno run --allow-net --allow-run --allow-read --allow-env app.ts
