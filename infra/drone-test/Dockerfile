FROM docker:dind

# Install ZFS tools and gcloud SDK
RUN apk add --no-cache \
        bash \
        python3 \
        py3-pip \
        curl \
        gcc \
        python3-dev \
        musl-dev \
        linux-headers \
        zfs zfs-lts \
        && \
    # Install gcloud SDK
    curl -o google-cloud-cli.tar.gz https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz && \
    tar -xf google-cloud-cli.tar.gz && \
    ./google-cloud-sdk/install.sh --quiet --usage-reporting=false --path-update=false && \
    rm google-cloud-cli.tar.gz && \
    ln -s /google-cloud-sdk/bin/gcloud /usr/local/bin/gcloud && \
    ln -s /google-cloud-sdk/bin/gsutil /usr/local/bin/gsutil && \
    # Clean up
    rm -rf /var/cache/apk/*

# Default command
CMD ["/bin/sh"]