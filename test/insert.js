import http from 'k6/http';
import exec from 'k6/execution';
import { b64encode } from 'k6/encoding';
import { check, group } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

import resPatient from './seed/patient.js';
import resObservation from './seed/observation.js';
import resEncounter from './seed/encounter.js';
import resPractitioner from './seed/practitioner.js';
import resMedicationRequest from './seed/medication-request.js';
import resOrganization from './seed/organization.js';
import resClaim from './seed/claim.js';
import resLocation from './seed/location.js';
import resExplanationOfBenefit from './seed/explanation-of-benefit.js';


export const options = {
  discardResponseBodies: false,
  scenarios: {
    insert: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 10000,
      maxDuration: '60s',
    },
  },
};

export function setup() {
  const headers = {
    "Accept-Encoding": "gzip",
    "Accept": "application/json",
    "Content-Type": "application/json",
  }
  const baseUrl = __ENV.BASE_URL;
  const authUser = __ENV.AUTH_USER;
  const authPassword = __ENV.AUTH_PASSWORD;
  if (authUser && authPassword) {
    const encodedCredentials = b64encode(`${authUser}:${authPassword}`);
    headers["Authorization"] = `Basic ${encodedCredentials}`;
  };
  return {
    baseUrl,
    params: { headers },
  }
}

export default function (inputs) {
  let claimId, encounterId, locationId, medicationRequestId, organizationId, patientId, practitionerId;

  group('Patient', () => {
    const x = http.post(`${inputs.baseUrl}/Patient`, JSON.stringify(resPatient), inputs.params);
    if (!check(x, { 'Patient created': ({ status }) => status === 201 })) return;
    patientId = x.json('id');
  })

  group('Location', () => {
    const x = http.post(`${inputs.baseUrl}/Location`, JSON.stringify(resLocation), inputs.params);
    if (!check(x, { 'Location created': ({ status }) => status === 201 })) return;
    locationId = x.json('id');
  })

  group('Organization', () => {
    const x = http.post(`${inputs.baseUrl}/Organization`, JSON.stringify(resOrganization), inputs.params);
    if (!check(x, { 'Organization created': ({ status }) => status === 201 })) return;
    organizationId = x.json('id');
  })

  group('Practitioner', () => {
    const x = http.post(`${inputs.baseUrl}/Practitioner`, JSON.stringify(resPractitioner), inputs.params);
    if (!check(x, { 'Practitioner created': ({ status }) => status === 201 })) return;
    practitionerId = x.json('id');
  })

  group('Encounter', () => {
    const payload = Object.assign({}, resEncounter, {
      subject: { reference: `Patient/${patientId}`},
      location: [Object.assign({}, resEncounter.location[0], {
        location: { reference: `Location/${locationId}` }})],
      participant: [Object.assign({}, resEncounter.participant[0], {
        individual: { reference: `Practitioner/${practitionerId}` }})],
      serviceProvider: { reference: `Organization/${organizationId}` },
    });
    const x = http.post(`${inputs.baseUrl}/Encounter`, JSON.stringify(payload), inputs.params);
    if (!check(x, { 'Encounter created': ({ status }) => status === 201 })) return;
    encounterId = x.json('id');
  })

  group('Observation', () => {
    const payload = Object.assign({}, resObservation, {
      encounter: { reference: `Encounter/${encounterId}` },
      subject: { reference: `Patient/${patientId}` }});
    const x = http.post(`${inputs.baseUrl}/Observation`, JSON.stringify(payload), inputs.params);
    if (!check(x, { 'Observation created': ({ status }) => status === 201 })) return;
  })

  group('MedicationRequest', () => {
    const payload = Object.assign({}, resMedicationRequest, {
      encounter: { reference: `Encounter/${encounterId}` },
      requester: { reference: `Practitioner/${practitionerId}` },
      subject: { reference: `Patient/${patientId}` }});
    const x = http.post(`${inputs.baseUrl}/MedicationRequest`, JSON.stringify(payload), inputs.params);
    if (!check(x, { 'MedicationRequest created': ({ status }) => status === 201 })) return;
    medicationRequestId = x.json('id');
  })

  group('Claim', () => {
    const payload = Object.assign({}, resClaim, {
      patient: { reference: `Patient/${patientId}` },
      provider: { reference: `Organization/${organizationId}` },
      prescription: { reference: `MedicationRequest/${medicationRequestId}` },
      item: [ Object.assign({}, resClaim.item[0], {
        encounter: [{ reference: `Encounter/${encounterId}` }]})]});
    const x = http.post(`${inputs.baseUrl}/Claim`, JSON.stringify(payload), inputs.params);
    if (!check(x, { 'Claim created': ({ status }) => status === 201 })) return;
    claimId = x.json('id');
  })

  group('ExplanationOfBenefit', () => {
    const payload = Object.assign({}, resExplanationOfBenefit, {
      contained: [
        Object.assign({}, resExplanationOfBenefit.contained[0], {
          subject: { reference: `Patient/${patientId}` },
          requester: { reference: `Practitioner/${practitionerId}` },
          performer: [{ reference: `Patient/${patientId}` }]}),
        Object.assign({}, resExplanationOfBenefit.contained[1], {
          beneficiary: { reference: `Patient/${patientId}` }})],
      patient: { reference: `Patient/${patientId}` },
      provider: { reference: `Practitioner/${practitionerId}` },
      claim: { reference: `Claim/${claimId}` },
      careTeam: [ Object.assign({}, resExplanationOfBenefit.careTeam[0], {
        provider: { reference: `Practitioner/${practitionerId}` }})],
      item: [
        Object.assign({}, resExplanationOfBenefit.item[0], {
          encounter: [{ reference: `Encounter/${encounterId}` }]}),
        Object.assign({}, resExplanationOfBenefit.item[1])]});
    const x = http.post(`${inputs.baseUrl}/ExplanationOfBenefit`, JSON.stringify(payload), inputs.params);
    if (!check(x, { 'ExplanationOfBenefit created': ({ status }) => status === 201 })) return;
  })
}
