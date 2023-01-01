# FROM rust:1.66-bullseye
FROM debian:bookworm
RUN apt-get update
RUN apt-get install -y build-essential libcap-dev curl wget make unzip lld mold
ENV PATH="root/.cargo/bin:$PATH"
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain nightly
RUN cargo install cargo-watch
RUN mkdir -p /build
ENV CARGO_TARGET_DIR=/build
# ENTRYPOINT cargo watch -- cargo run

# HCL parser cli https://github.com/hashicorp/hcl/tree/main/cmd/hcldec
# RUN go install github.com/hashicorp/hcl/v2/cmd/hcldec@latest

# BUN
# RUN curl -fsSL https://bun.sh/install | bash

# INSTALLATION http://www.ucw.cz/moe/isolate.1.html
WORKDIR /isolate
ENV GRUB_CMDLINE_LINUX_DEFAULT="cgroup_enable=memory swapaccount=1 systemd.unified_cgroup_hierarchy=false systemd.legacy_systemd_cgroup_controller=false sys.fs.protected_hardlinks=1"
RUN wget "https://github.com/ioi/isolate/archive/refs/tags/v1.9.tar.gz" -O isolate.tar.gz
RUN tar -xzf ./isolate.tar.gz --strip-components 1
RUN make isolate
RUN make install
