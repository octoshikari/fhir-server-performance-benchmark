#!/bin/sh

set -e

now=$(date +%s)

# take RUNID from argument or environment, the default value is current time UTC
RUNID=${RUNID:-$(date -u +"%Y-%m-%dT%H:%M:%SZ")}
if [[ $# -eq 1 ]]; then
  RUNID=$1
fi

IDTAG=fhirimpl
OUTDIR=${OUTDIR:-/tmp}
PAUSE=30
DEFAULT_RUN_ARGS="--no-usage-report --tag runid=${RUNID}"
RUN_ARGS=${DEFAULT_RUN_ARGS}

if [ -d /auth ]; then
  AUTH_DIR=/auth
else
  AUTH_DIR=$(mktemp -d auth-XXXXXX)
  trap "rm -rf ${AUTH_DIR}" EXIT
fi

function pause() {
  sleep $PAUSE
}

function longerPause() {
  sleep $(( PAUSE * 2 ))
}

function run() {
  id=$1
  shift
  arg=$1
  if [ "${CI}" != "" ]; then
    RUN_ARGS="${RUN_ARGS} --quiet"
  fi
  # generate auth params
  current_run_args=${RUN_ARGS}
  export RUN_ARGS="${DEFAULT_RUN_ARGS} --quiet"
  export AUTH_FILE=${AUTH_DIR}/${id}.json
  eval k6 run auth.js --log-format raw 1>/dev/null 2> ${AUTH_FILE}
  # run the actual test
  export RUN_ARGS=${current_run_args}
  echo -e "\n[$(date +%H:%M:%S)] \033[1m${id}: ${arg}\033[0m\n"
  eval k6 run ${RUN_ARGS} --tag ${IDTAG}=${id} "$@"
}

function runAidbox() {
  AUTH_USER=root AUTH_PASSWORD=secret BASE_URL=http://aidbox:8080/fhir run aidbox $1
}

function runHapi() {
  BASE_URL=http://hapi:8080/fhir run hapi $1
}

function runMedplum() {
  BASE_URL=http://medplum:8103/fhir/R4 \
  AUTH_USER=admin@example.com \
  AUTH_PASSWORD=medplum_admin \
  OAUTH2_LOGIN_URL=http://medplum:8103/auth/login \
  OAUTH2_TOKEN_URL=http://medplum:8103/oauth2/token \
    run medplum $1
}


runMedplum prewarm.js
runAidbox  prewarm.js
runHapi    prewarm.js

runMedplum import-seed.js
runAidbox  import-seed.js
runHapi    import-seed.js

RUN_ARGS="${DEFAULT_RUN_ARGS} -o experimental-prometheus-rw"

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

cat << EOF > ${OUTDIR}/last-run.json
{
  "start": ${now},
  "end": $(date +%s),
  "runid": "${RUNID}"
}
EOF
