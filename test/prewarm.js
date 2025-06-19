export { default, setup } from './crud.js'

export const options = {
  discardResponseBodies: false,
  scenarios: {
    warmup: {
      executor: 'per-vu-iterations',
      vus: 10,
      iterations: 100,
      maxDuration: '1m',
      gracefulStop: '30s',
    },
  },
};

