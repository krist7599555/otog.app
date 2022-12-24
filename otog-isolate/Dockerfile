# FROM debian:bullseye-slim
FROM denoland/deno:debian-1.29.0
WORKDIR /app

RUN cgroup_enable=memory swapaccount=1
RUN apt-get update && apt-get -y install g++ libcap-dev make wget
RUN wget -qO- https://github.com/ioi/isolate/archive/refs/tags/v1.9.tar.gz | tar xvz
WORKDIR /app/isolate-1.9
RUN make install
WORKDIR /app
# ENTRYPOINT /usr/local/bin/isolate

COPY . .
ENV PORT=8080
RUN deno cache app.ts
CMD deno run --allow-net --allow-run --allow-read --allow-env app.ts
