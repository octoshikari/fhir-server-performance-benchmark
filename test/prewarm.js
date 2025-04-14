export { default, setup } from './create.js';

export const options = {
  discardResponseBodies: false,
  scenarios: {
    warmup: {
      executor: 'per-vu-iterations',
      vus: 100,
      iterations: 1000,
      maxDuration: '45s',
      gracefulStop: '5s',
    },
  },
};
