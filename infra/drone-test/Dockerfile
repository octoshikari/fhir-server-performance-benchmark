FROM google/cloud-sdk:alpine

# Install Docker, ZFS tools, and other required packages
RUN apk update && \
    apk add --no-cache \
        docker \
        docker-cli \
        docker-compose \
        ca-certificates \
        curl \
        gnupg \
        bash \
        coreutils \
        grep \
        zfs \
        zfs-utils \
        util-linux \
        && \
    rm -rf /var/cache/apk/*

# Verify installations
RUN docker --version && \
    gcloud --version && \
    zfs version || echo "ZFS not available in container"

# Set entrypoint to bash for flexibility
ENTRYPOINT ["/bin/bash"]