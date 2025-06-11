import http from 'k6/http'
import { check } from 'k6'
import { Counter } from 'k6/metrics'

const bundleSize = new Counter('bundle_size')
const authHeader = JSON.parse(open(__ENV.AUTH_FILE))

export const options = {
  discardResponseBodies: false,
  scenarios: {
    import: {
      executor: 'shared-iterations',
      vus: 4,
      iterations: 1000,
      maxDuration: '5m',
      gracefulStop: '0s',
    },
  },
}

export function setup() {
  return {
    baseUrl: __ENV.BASE_URL,
    bundleUrl: __ENV.BUNDLE_URL,
    params: {
      headers: {
        ...authHeader,
        "Accept-Encoding": "gzip",
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
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
