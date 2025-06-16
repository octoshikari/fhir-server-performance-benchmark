import http from 'k6/http'
import { check } from 'k6'

export function jsonPatch(obj, path, value) {
  let pt = obj;
  const ks = path.split('.');
  while (ks.length > 1) pt = pt[ks.shift()];
  pt[ks.shift()] = value;
  return obj;
}

export function is200 (url, params) {
  const res = http.get(url, params)
  return check(res, {'Status 200': ({ status }) => status === 200})
}
