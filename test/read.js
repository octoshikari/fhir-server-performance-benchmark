import http from 'k6/http';
import { check, group } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

import authenticate from './lib/auth.js';


export const options = {
  discardResponseBodies: false,
  scenarios: {
    read: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 1000000,
      maxDuration: '5m',
    },
  },
};

const resourceTypes = [
  'Patient',
  'Encounter',
  'Observation',
  'ExplanationOfBenefit'
];

export function setup() {
  const payload = {
    baseUrl: __ENV.BASE_URL,
    ids: {},
    params: {
      headers: authenticate({
        "Accept-Encoding": "gzip",
        "Accept": "application/json",
        "Content-Type": "application/json",
      })
    },
  }
  resourceTypes.forEach(rt => {
    const x = http.get(`${payload.baseUrl}/${rt}?_count=100`, payload.params);
    if (!check(x, { [`${rt} list`]: ({ status }) => status === 200 })) {
      fail(`${rt} list => ${x.status}`);
    }
    payload.ids[rt] = x.json('entry').map(e => e.resource.id);
  })
  return payload;
}

export default function ({ baseUrl, ids, params }) {
  Object.entries(ids).forEach(([rt, ids]) => {
    group(rt, () => {
      const id = randomItem(ids);
      const x = http.get(`${baseUrl}/${rt}/${id}`, params);
      check(x, { [rt]: ({ status }) => status === 200 });
      check(x, { [rt]: () => x.json('id') === id });
    })
  })
}
