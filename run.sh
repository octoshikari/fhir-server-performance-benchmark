#!/bin/sh

set -e

IDTAG=fhirimpl
PAUSE=60

function pause() {
  sleep $PAUSE
}

function run() {
  k6 run -o experimental-prometheus-rw "$@"
}

function runAidbox() {
  AUTH_USER=root AUTH_PASSWORD=secret BASE_URL=http://aidbox:8080 run --tag ${IDTAG}=aidbox "$@"
}

function runHapi() {
  BASE_URL=http://hapi:8080/fhir run --tag ${IDTAG}=hapi "$@"
}

function runMedplum() {
  BASE_URL=http://medplum:8103/fhir/R4 \
  AUTH_USER=admin@example.com \
  AUTH_PASSWORD=medplum_admin \
  OAUTH2_LOGIN_URL=http://medplum:8103/auth/login \
  OAUTH2_TOKEN_URL=http://medplum:8103/oauth2/token \
    run --tag ${IDTAG}=medplum "$@"
}

runAidbox  create.js
pause
runHapi    create.js
pause
runMedplum create.js
