import http from 'k6/http';
import { check, group } from 'k6';

import authenticate from './lib/auth.js';
import jsonPatch from './lib/json.js';

import claim from './seed/claim.js';
import encounter from './seed/encounter.js';
import explanationOfBenefit from './seed/explanation-of-benefit.js';
import location from './seed/location.js';
import medicationRequest from './seed/medication-request.js';
import observation from './seed/observation.js';
import organization from './seed/organization.js';
import patient from './seed/patient.js';
import practitioner from './seed/practitioner.js';


export const options = {
  discardResponseBodies: false,
  scenarios: {
    create: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 100000,
      maxDuration: '5m',
    },
  },
};

export function setup() {
  return {
    baseUrl: __ENV.BASE_URL,
    params: {
      headers: authenticate({
        "Accept-Encoding": "gzip",
        "Accept": "application/json",
        "Content-Type": "application/json",
      })
    },
    seeds: {
      claim: JSON.stringify(claim),
      encounter: JSON.stringify(encounter),
      explanationOfBenefit: JSON.stringify(explanationOfBenefit),
      location: JSON.stringify(location),
      medicationRequest: JSON.stringify(medicationRequest),
      observation: JSON.stringify(observation),
      organization: JSON.stringify(organization),
      patient: JSON.stringify(patient),
      practitioner: JSON.stringify(practitioner),
    }
  }
}

export default function ({ baseUrl, params, seeds }) {
  const ids = {}

  group('Patient', () => {
    const x = http.post(`${baseUrl}/Patient`, seeds.patient, params);
    if (!check(x, { 'Patient created': ({ status }) => status === 201 })) return;
    ids.patient = `Patient/${x.json('id')}`;
  })

  group('Location', () => {
    const x = http.post(`${baseUrl}/Location`, seeds.location, params);
    if (!check(x, { 'Location created': ({ status }) => status === 201 })) return;
    ids.location = `Location/${x.json('id')}`;
  })

  group('Organization', () => {
    const x = http.post(`${baseUrl}/Organization`, seeds.organization, params);
    if (!check(x, { 'Organization created': ({ status }) => status === 201 })) return;
    ids.organization = `Organization/${x.json('id')}`;
  })

  group('Practitioner', () => {
    const x = http.post(`${baseUrl}/Practitioner`, seeds.practitioner, params);
    if (!check(x, { 'Practitioner created': ({ status }) => status === 201 })) return;
    ids.practitioner = `Practitioner/${x.json('id')}`;
  })

  group('Encounter', () => {
    const payload = JSON.parse(seeds.encounter);
    jsonPatch(payload, 'subject.reference', ids.patient);
    jsonPatch(payload, 'location.0.location.reference', ids.location);
    jsonPatch(payload, 'participant.0.individual.reference', ids.practitioner);
    jsonPatch(payload, 'serviceProvider.reference', ids.organization);
    const x = http.post(`${baseUrl}/Encounter`, JSON.stringify(payload), params);
    if (!check(x, { 'Encounter created': ({ status }) => status === 201 })) return;
    ids.encounter = `Encounter/${x.json('id')}`;
  })

  group('Observation', () => {
    const payload = JSON.parse(seeds.observation);
    jsonPatch(payload, 'encounter.reference', ids.encounter);
    jsonPatch(payload, 'subject.reference', ids.patient);
    const x = http.post(`${baseUrl}/Observation`, JSON.stringify(payload), params);
    if (!check(x, { 'Observation created': ({ status }) => status === 201 })) return;
  })

  group('MedicationRequest', () => {
    const payload = JSON.parse(seeds.medicationRequest);
    jsonPatch(payload, 'encounter.reference', ids.encounter);
    jsonPatch(payload, 'requester.reference', ids.practitioner);
    jsonPatch(payload, 'subject.reference', ids.patient);
    const x = http.post(`${baseUrl}/MedicationRequest`, JSON.stringify(payload), params);
    if (!check(x, { 'MedicationRequest created': ({ status }) => status === 201 })) return;
    ids.medicationRequest = `MedicationRequest/${x.json('id')}`;
  })

  group('Claim', () => {
    const payload = JSON.parse(seeds.claim);
    jsonPatch(payload, 'patient.reference', ids.patient);
    jsonPatch(payload, 'provider.reference', ids.organization);
    jsonPatch(payload, 'prescription.reference', ids.medicationRequest);
    jsonPatch(payload, 'item.0.encounter.0.reference', ids.encounter);
    const x = http.post(`${baseUrl}/Claim`, JSON.stringify(payload), params);
    if (!check(x, { 'Claim created': ({ status }) => status === 201 })) return;
    ids.claim = `Claim/${x.json('id')}`;
  })

  group('ExplanationOfBenefit', () => {
    const payload = JSON.parse(seeds.explanationOfBenefit);
    jsonPatch(payload, 'contained.0.subject.reference', ids.patient);
    jsonPatch(payload, 'contained.0.requester.reference', ids.practitioner);
    jsonPatch(payload, 'contained.0.performer.0.reference', ids.patient);
    jsonPatch(payload, 'contained.1.beneficiary.reference', ids.patient);
    jsonPatch(payload, 'patient.reference', ids.patient);
    jsonPatch(payload, 'provider.reference', ids.practitioner);
    jsonPatch(payload, 'claim.reference', ids.claim);
    jsonPatch(payload, 'careTeam.0.provider.reference', ids.practitioner);
    jsonPatch(payload, 'item.0.encounter.0.reference', ids.encounter);
    const x = http.post(`${baseUrl}/ExplanationOfBenefit`, JSON.stringify(payload), params);
    if (!check(x, { 'ExplanationOfBenefit created': ({ status }) => status === 201 })) return;
  })
}
