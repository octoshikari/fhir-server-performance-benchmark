import exec from 'k6/execution'
import http from 'k6/http'
import { check, group } from 'k6'
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js'

import authenticate from './lib/auth.js'
import jsonPatch from './lib/json.js'

export const options = {
  discardResponseBodies: false,
  scenarios: {
    import: {
      executor: 'shared-iterations',
      vus: 10,
      iterations: 1000,
      maxDuration: '5m',
    },
  },
}

export function setup() {
  return {
    baseUrl: __ENV.BASE_URL,
    bundleUrl: __ENV.BUNDLE_URL,
    params: {
      headers: authenticate({
        "Accept-Encoding": "gzip",
        "Accept": "application/json",
        "Content-Type": "application/json",
      }),
    },
  }
}

export default function ({ baseUrl, bundleUrl, params, }) {
  const bundle = http.get(
    bundleUrl,
    { tags: { group: '::source' } })
  const x = http.post(
    `${baseUrl}`,
    bundle.body,
    { ...params, responseType: 'none', tags: { group: '::import' } })
  check(x, { ['Bundle import']: ({ status }) => status === 200 })
}
