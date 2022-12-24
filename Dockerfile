FROM node:18.0-slim AS base
RUN npm i -g pnpm@7.19
COPY .npmrc package.json pnpm-lock.yaml

FROM base AS dependencies
WORKDIR /app
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm run build
RUN pnpm prune --prod

FROM base
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
CMD ["node", "./build/index.js"]
