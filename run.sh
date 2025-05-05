#!/bin/sh

set -e

# take RUNID from argument or environment, the default value is current time UTC
RUNID=${RUNID:-$(date -u +"%Y-%m-%dT%H:%M:%SZ")}
if [[ $# -eq 1 ]]; then
  RUNID=$1
fi

IDTAG=fhirimpl
PAUSE=30
RUN_ARGS="--no-usage-report --tag runid=${RUNID}"

function pause() {
  sleep $PAUSE
}

function longerPause() {
  sleep $(( PAUSE * 2 ))
}

function run() {
  if [ "${CI}" != "" ]; then
    RUN_ARGS="${RUN_ARGS} --quiet"
  fi
  eval k6 run ${RUN_ARGS} "$@"
}

function runAidbox() {
  echo -e "\n\033[1mRunning: Aidbox $1\033[0m\n"
  AUTH_USER=root AUTH_PASSWORD=secret BASE_URL=http://aidbox:8080/fhir run --tag ${IDTAG}=aidbox $1
}

function runHapi() {
  echo -e "\n\033[1mRunning: Hapi $1\033[0m\n"
  BASE_URL=http://hapi:8080/fhir run --tag ${IDTAG}=hapi $1
}

function runMedplum() {
  echo -e "\n\033[1mRunning: Medplum $1\033[0m\n"
  BASE_URL=http://medplum:8103/fhir/R4 \
  AUTH_USER=admin@example.com \
  AUTH_PASSWORD=medplum_admin \
  OAUTH2_LOGIN_URL=http://medplum:8103/auth/login \
  OAUTH2_TOKEN_URL=http://medplum:8103/oauth2/token \
    run --tag ${IDTAG}=medplum $1
}


runMedplum prewarm.js
runAidbox  prewarm.js
runHapi    prewarm.js

runMedplum import-seed.js
runAidbox  import-seed.js
runHapi    import-seed.js

RUN_ARGS="${RUN_ARGS} -o experimental-prometheus-rw"

runMedplum crud.js
pause
runAidbox  crud.js
pause
runHapi    crud.js

pause

runMedplum import.js
longerPause
runAidbox  import.js
longerPause
runHapi    import.js
