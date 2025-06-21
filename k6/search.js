import { group } from 'k6'
import { is200, headers } from './util.js'

export const options = {
  discardResponseBodies: true,
  scenarios: {
    search: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
      gracefulStop: '30s',
    },
  },
}

export function setup() {
  return {
    baseUrl: __ENV.BASE_URL,
    params: { headers: headers() },
  }
}

function searchTest(baseUrl, resourceType, query, params) {
  group(resourceType, () => {
    is200(`${baseUrl}/${resourceType}?${query}`, params)
  })
}

const count = 100

export default function({ baseUrl, params }) {
  group('search', () => {
    group('text', () => {
      searchTest(baseUrl, 'Patient', `name=John&_count=${count}`, params)
      searchTest(baseUrl, 'Patient', `name=Undefined&_count=${count}`, params)
      searchTest(baseUrl, 'Patient', `name=Some_long_unexisting_string&_count=${count}`, params)
      searchTest(baseUrl, 'Patient', `name:contains=ohn&_count=${count}`, params)
      searchTest(baseUrl, 'Patient', `given:exact=Cathie710&_count=${count}`, params)
    })
    group('date', () => {
      searchTest(baseUrl, 'Patient', `birthdate=2007-03-07&_count=${count}`, params)
      searchTest(baseUrl, 'Patient', `birthdate=eq2007-03-07&_count=${count}`, params)
      searchTest(baseUrl, 'Patient', `birthdate=ne2007-03-07&_count=${count}`, params)
      searchTest(baseUrl, 'Patient', `birthdate=lt2007-03-07&_count=${count}`, params)
      searchTest(baseUrl, 'Patient', `birthdate=gt2007-03-07&_count=${count}`, params)
    })
    group('token', () => {
      searchTest(baseUrl, 'Observation', `code=29463-7&_count=${count}`, params)
      searchTest(baseUrl, 'Observation', `code=http://loinc.org|29463-7&_count=${count}`, params)
      searchTest(baseUrl, 'Observation', `code=|29463-7&_count=${count}`, params)
      searchTest(baseUrl, 'Observation', `code=http://loinc.org|&_count=${count}`, params)
    })
    group('reference', () => {
      searchTest(baseUrl, 'Observation', `patient=184cf049-bb4e-91c1-0a44-41c9512eee0c&_count=${count}`, params)
    })
    group('parameters', () => {
      searchTest(baseUrl, 'Patient', `_id=184cf049-bb4e-91c1-0a44-41c9512eee0c&_revinclude=Observation:patient&_count=${count}`, params)
    })
  })
}
