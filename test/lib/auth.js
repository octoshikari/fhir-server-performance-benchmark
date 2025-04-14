import http from 'k6/http';
import { check } from 'k6';
import { b64encode } from 'k6/encoding';

const oauth2 = (user, pass) => {
  const loginURL = __ENV.OAUTH2_LOGIN_URL;
  const tokenURL = __ENV.OAUTH2_TOKEN_URL;

  if (!loginURL && !tokenURL) return null;

  const challenge = "my_challenge";

  const authCode = http.post(loginURL, JSON.stringify({
    email: user,
    password: pass,
    codeChallengeMethod: "plain",
    codeChallenge: challenge,
  }), { headers: {"Content-Type": "application/json"} });

  if (!check(authCode, { 'OAuth2 auth code': ({ status }) => status === 200 })) {
    console.log("auth code request failed:", authCode.body);
    return null;
  }

  const token = http.post(
    tokenURL,
    `grant_type=authorization_code&code=${authCode.json('code')}&code_verifier=${challenge}`,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

  if (!check(token, { 'OAuth2 access token': ({ status }) => status === 200 })) {
    console.log('auth token request failed', token.body);
    return null;
  }

  return `Bearer ${token.json('access_token')}`;
}

const base64 = (user, pass) =>  user && pass ? `Basic ${b64encode(`${user}:${pass}`)}` : null

export default function (headers) {
  const user = __ENV.AUTH_USER;
  const pass = __ENV.AUTH_PASSWORD;
  const auth = oauth2(user, pass) || base64(user, pass);

  if (auth) {
    headers["Authorization"] = auth;
  }

  return headers;
}
