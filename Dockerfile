FROM node:18.0-slim AS base
WORKDIR /app
RUN cgroup_enable=memory swapaccount=1
RUN apt-get update && apt-get -y install g++ libcap-dev vim net-tools ftp vsftpd curl wget
# && rm -rf /var/lib/apt/lists/*

RUN npm i -g pnpm@7.19
COPY .npmrc package.json pnpm-lock.yaml .
RUN ls -la

FROM base AS dependencies
WORKDIR /app
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
ENV NODE_ENV=production
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
ENV MOUNT_VOLUME=/otog
RUN pnpm run build
RUN pnpm prune --prod

FROM base
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY /otog-ftp ./otog-ftp
# CMD ["vsftpd", "/app/otog-ftp/vsftpd.conf", "&", "node", "./build/index.js"]
CMD ["node", "./build/index.js"]
