import http from 'k6/http';
import exec from 'k6/execution';
import { b64encode } from 'k6/encoding';
import { check } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

import resPatient from './seed/patient.js';
import resObservation from './seed/observation.js';
import resEncounter from './seed/encounter.js';


export const options = {
  discardResponseBodies: true,
  scenarios: {
    patient: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 10000,
      maxDuration: '30s',
      exec: 'patient',
    },
    encounter: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 10000,
      maxDuration: '30s',
      exec: 'encounter',
    },
    observation: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 10000,
      maxDuration: '30s',
      exec: 'observation',
    },
  },
};

export function setup() {
  const baseUrl = __ENV.BASE_URL;
  const authUser = __ENV.AUTH_USER;
  const authPassword = __ENV.AUTH_PASSWORD;
  const encodedCredentials = b64encode(`${authUser}:${authPassword}`);
  const params = {
    headers: {
      "Accept-Encoding": "gzip",
      "Conten-Type": "application/json",
      "Authorization": `Basic ${encodedCredentials}`
    }
  };
  return {
    baseUrl,
    params,
    idPrefix: randomString(10, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'),
    patient: resPatient,
    encounter: resEncounter,
    observation: resObservation,
  }
}

const execute = (baseUrl, idPrefix, params, resourceType, resource) => {
  const iteration = exec.scenario.iterationInInstance;
  const payload = Object.assign({}, resource, { id: `${idPrefix}-${iteration}` });
  const res = http.post(`${baseUrl}/${resourceType}`, JSON.stringify(payload), params);
  check(res, { [`${resourceType} status`]: ({ status }) => status === 201 });
}

export function patient({ baseUrl, idPrefix, params, patient }) {
  return execute(baseUrl, idPrefix, params, 'Patient', patient);
}

export function encounter({ baseUrl, idPrefix, params, encounter }) {
  return execute(baseUrl, idPrefix, params, 'Encounter', encounter);
}

export function observation({ baseUrl, idPrefix, params, observation }) {
  return execute(baseUrl, idPrefix, params, 'Observation', observation);
}
