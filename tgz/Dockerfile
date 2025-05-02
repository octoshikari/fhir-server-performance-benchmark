FROM golang:1.24.2 AS builder

WORKDIR /srv

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main

# FROM scratch
# COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
# COPY --from=ghcr.io/tarampampam/curl:8.6.0 /bin/curl /bin/curl
# COPY --from=builder /srv/main /srv/main

WORKDIR /data
VOLUME /data
ENTRYPOINT ["/srv/main"]
HEALTHCHECK --interval=5s --timeout=1s --retries=100 --start-period=5s CMD [ \
  "curl", "--fail", "http://127.0.0.1:8080/healthz" \
]
