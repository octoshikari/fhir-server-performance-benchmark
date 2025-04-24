import exec from 'k6/execution'
import http from 'k6/http';
import { check, group } from 'k6';
import { SharedArray } from 'k6/data'
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

import authenticate from './lib/auth.js';
import jsonPatch from './lib/json.js';

const bundleIndex = new SharedArray('bundle index', () => JSON.parse(open('bundle-index.json')))

export const options = {
  discardResponseBodies: false,
  scenarios: {
    import: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '1m',
      gracefulStop: '30s',
    },
  },
};

export function setup() {
  const setup = {
    baseUrl: __ENV.BASE_URL,
    bundleUrl: __ENV.BUNDLE_URL,
    params: {
      headers: authenticate({
        "Accept-Encoding": "gzip",
        "Accept": "application/json",
        "Content-Type": "application/json",
      }),
      // responseType: 'none', // to ignore response body
    },
  }

  const seeds = ["hospitalInformation1744982992417.json", "practitionerInformation1744982992417.json"]
  seeds.forEach(x => {
    const src = http.get(`${setup.bundleUrl}/${x}`)
    const dst = http.post(setup.baseUrl, src.body, setup.params)
    console.log(dst.status)
  })
  return setup
}

export default function ({ baseUrl, bundleUrl, params, }) {
  // const bi = randomItem(bundleIndex)
  const bi = bundleIndex[0]
  console.log(bi)
  const bundle = http.get(`${bundleUrl}/${bi}`)

  const x = http.post(`${baseUrl}/fhir`, bundle.body, params)
  console.log(x.status)
  console.log(x.json())
  check(x, { ['Bundle import']: ({ status }) => status === 200 })
}
