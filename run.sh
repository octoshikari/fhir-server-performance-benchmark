#!/bin/sh

set -e

function run() {
  k6 run -o experimental-prometheus-rw "$@"
}

# aidbox
AUTH_USER=root AUTH_PASSWORD=secret BASE_URL=http://aidbox:8080 \
  run insert.js --tag testid=aidbox

# hapi
BASE_URL=http://hapi:8080/fhir \
  run insert.js --tag testid=hapi
