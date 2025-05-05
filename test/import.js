import http from 'k6/http'
import { check } from 'k6'
import { Counter } from 'k6/metrics'

import authenticate from './lib/auth.js'

const bundleSize = new Counter('bundle_size')

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
    baseUrl,
    bundle.body,
    { ...params, tags: { group: '::import' } })
  if (!check(x, { ['Bundle import']: ({ status }) => status === 200 })) return
  bundleSize.add(x.json().entry.length)
}
