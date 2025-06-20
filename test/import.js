import http from 'k6/http'
import { check } from 'k6'
import { Counter } from 'k6/metrics'
import { headers } from './util.js'

const bundleSize = new Counter('bundle_size')

export const options = {
  discardResponseBodies: false,
  scenarios: {
    import: {
      executor: 'constant-vus',
      vus: 8,
      duration: '10m',
      gracefulStop: '30s',
    },
  },
}

export function setup() {

  const bundleUrl = __ENV.BUNDLE_URL
  const baseUrl = __ENV.BASE_URL
  const params = { headers: headers() }

  const seeds = ["hospitalInformation.json", "practitionerInformation.json"]
  seeds.forEach(x => {
    const src = http.get(`${bundleUrl}/${x}`)
    http.post(baseUrl, src.body, params)
  })

  return {
    baseUrl,
    bundleUrl,
    params,
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
