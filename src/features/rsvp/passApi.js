/**
 * Client for the approval flow.
 *   fetchPass(token)        -> the guest's own pass (name, status, code once approved)
 *   adminCall(password, …)  -> couple-only guest-list actions (see api/admin.js)
 * Both use relative URLs, so they work from any folder or sub-path on Vercel.
 */
const PASS_ENDPOINT = 'api/pass';
const ADMIN_ENDPOINT = 'api/admin';

export class PassError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'PassError';
    this.status = status;
  }
}

async function readJson(res) {
  // A static host answers 200 + HTML for unknown paths: that means "no API here".
  const type = res.headers.get('content-type') || '';
  if (!type.includes('json')) throw new PassError('The guest list is not connected on this site yet.', 501);
  return res.json();
}

export async function fetchPass(token) {
  let res;
  try {
    res = await fetch(`${PASS_ENDPOINT}?t=${encodeURIComponent(token)}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  } catch {
    throw new PassError('We could not reach the server. Please check your connection and try again.', 0);
  }
  const data = await readJson(res);
  if (!res.ok) throw new PassError(data.error || 'Something went wrong.', res.status);
  return data;
}

export async function adminCall(password, body) {
  let res;
  try {
    res = await fetch(ADMIN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
      body: JSON.stringify(body),
    });
  } catch {
    throw new PassError('We could not reach the server.', 0);
  }
  const data = await readJson(res);
  if (!res.ok) throw new PassError(data.error || `The server replied ${res.status}.`, res.status);
  return data;
}

/** Where a guest's pass lives, as a shareable link. */
export const passLink = (token) => `${window.location.origin}${window.location.pathname}#/pass?t=${token}`;

const PASS_KEY = 'bc-pass';
export const rememberPass = (token) => { try { localStorage.setItem(PASS_KEY, token); } catch { /* private mode */ } };
export const recallPass = () => { try { return localStorage.getItem(PASS_KEY) || ''; } catch { return ''; } };
