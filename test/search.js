import http from 'k6/http'
import { check, group, sleep } from 'k6'
import { is200 } from './util.js'

const authHeader = JSON.parse(open(__ENV.AUTH_FILE))

export const options = {
  discardResponseBodies: true,
  scenarios: {
    search: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
      gracefulStop: '0s',
    },
  },
}

export function setup() {
  return {
    baseUrl: __ENV.BASE_URL,
    params: {
      headers: {
        ...authHeader,
        "Accept-Encoding": "gzip",
        "Accept": "application/json",
        "Content-Type": "application/json",
      }
    },
  }
}

export default function({ baseUrl, params }) {
  group('search', () => {
    group('text', () => {
      is200(`${baseUrl}/Patient?name=John`, params)
      is200(`${baseUrl}/Patient?name=Undefined`, params)
      is200(`${baseUrl}/Patient?name=Some_long_unexisting_string`, params)
      is200(`${baseUrl}/Patient?name:contains=ohn`, params)
      is200(`${baseUrl}/Patient?given:exact=Cathie710`, params)
    })
    group('date', () => {
      is200(`${baseUrl}/Patient?birthdate=2007-03-07`, params);
      is200(`${baseUrl}/Patient?birthdate=eq2007-03-07`, params);
      is200(`${baseUrl}/Patient?birthdate=ne2007-03-07`, params);
      is200(`${baseUrl}/Patient?birthdate=lt2007-03-07`, params);
      is200(`${baseUrl}/Patient?birthdate=gt2007-03-07`, params);
    })
    group('token', () => {
      is200(`${baseUrl}/Observation?code=29463-7`, params)
      is200(`${baseUrl}/Observation?code=http://loinc.org|29463-7`, params)
      is200(`${baseUrl}/Observation?code=|29463-7`, params)
      is200(`${baseUrl}/Observation?code=http://loinc.org|`, params)
      // is200(`${baseUrl}/Observation?code:text=Potassium`, params)
    })
    group('reference', () => {
      is200(`${baseUrl}/Observation?patient=184cf049-bb4e-91c1-0a44-41c9512eee0c`, params);
    })
    group('parameters', () => {
      // is200(`${baseUrl}/Observation?_include=patient`, params);
      is200(`${baseUrl}/Patient?_id=184cf049-bb4e-91c1-0a44-41c9512eee0c&_revinclude=Observation:patient`, params);
    })
  })
}
