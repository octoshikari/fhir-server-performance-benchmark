#!/bin/sh

set -e

IDTAG=fhirimpl
PAUSE=60
RUNID=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
RUN_ARGS="--tag runid=${RUNID}"

function pause() {
  sleep $PAUSE
}

function run() {
  eval k6 run ${RUN_ARGS} "$@"
}

function runAidbox() {
  echo -e "\n\033[1mRunning: Aidbox\033[0m\n"
  AUTH_USER=root AUTH_PASSWORD=secret BASE_URL=http://aidbox:8080 run --tag ${IDTAG}=aidbox "$@"
}

function runHapi() {
  echo -e "\n\033[1mRunning: Hapi\033[0m\n"
  BASE_URL=http://hapi:8080/fhir run --tag ${IDTAG}=hapi "$@"
}

function runMedplum() {
  echo -e "\n\033[1mRunning: Medplum\033[0m\n"
  BASE_URL=http://medplum:8103/fhir/R4 \
  AUTH_USER=admin@example.com \
  AUTH_PASSWORD=medplum_admin \
  OAUTH2_LOGIN_URL=http://medplum:8103/auth/login \
  OAUTH2_TOKEN_URL=http://medplum:8103/oauth2/token \
    run --tag ${IDTAG}=medplum "$@"
}


runMedplum prewarm.js
runAidbox  prewarm.js
runHapi    prewarm.js

RUN_ARGS="${RUN_ARGS} -o experimental-prometheus-rw"

runMedplum create.js
pause
runAidbox  create.js
pause
runHapi    create.js
