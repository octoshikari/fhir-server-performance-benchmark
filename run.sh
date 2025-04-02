#!/bin/sh

set -e

IDTAG=fhirimpl

function run() {
  k6 run -o experimental-prometheus-rw "$@"
}

function runAidbox() {
  AUTH_USER=root AUTH_PASSWORD=secret BASE_URL=http://aidbox:8080 run --tag ${IDTAG}=aidbox "$@"
}

function runHapi() {
  BASE_URL=http://hapi:8080/fhir run --tag ${IDTAG}=hapi "$@"
}

runAidbox insert.js
runHapi insert.js
