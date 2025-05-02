import http from 'k6/http'
export { setup } from './import.js'

export const options = {
  discardResponseBodies: false,
  scenarios: {
    warmup: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '1m',
    },
  },
}

export default function ({ baseUrl, bundleUrl, params }) {
  const seeds = ["hospitalInformation.json", "practitionerInformation.json"]
  seeds.forEach(x => {
    const src = http.get(`${bundleUrl}/${x}`)
    http.post(baseUrl, src.body, params)
  })
}
