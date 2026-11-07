/**
 * Shared server helpers for the RSVP approval flow.
 * Files starting with "_" inside /api are NOT exposed as routes by Vercel.
 *
 * Storage: Upstash Redis through its REST API (plain fetch, no dependency).
 * Connect it from the Vercel dashboard: Storage > Marketplace > Upstash Redis.
 * Vercel injects KV_REST_API_URL / KV_REST_API_TOKEN (or the UPSTASH_* names).
 *
 * Keys
 *   rsvp:<id>       JSON record (the id is also the guest's private pass link token)
 *   rsvps           SET of every id
 *   phone:<last10>  id  (one RSVP per phone number)
 *   code:<CODE>     id  (access-card codes are unique)
 *   rl:<scope>:<ip> counters for rate limiting
 */
import crypto from 'node:crypto';

const URL_ = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/$/, '');
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

export const storeConfigured = () => Boolean(URL_ && TOKEN);

/** Runs Redis commands in one round trip. `commands` is an array of arrays. */
export async function redis(commands) {
  if (!storeConfigured()) throw new Error('The guest-list store is not connected.');
  const res = await fetch(`${URL_}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`The guest-list store replied ${res.status}.`);
  const out = await res.json();
  return out.map((r) => {
    if (r.error) throw new Error(r.error);
    return r.result;
  });
}

export const STATUS = {
  pending: 'pending', // waiting for the couple
  approved: 'approved', // card issued
  declined: 'declined', // couple said no
  notAttending: 'not_attending', // guest replied "regretfully declines"
};

const ID_RE = /^[A-Za-z0-9_-]{16}$/;
export const isValidId = (v) => typeof v === 'string' && ID_RE.test(v);

export const newId = () => crypto.randomBytes(12).toString('base64url'); // 16 chars, unguessable

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L
const makeCode = () => {
  const bytes = crypto.randomBytes(6);
  return 'BC-' + Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
};

/** Digits only. 0803… -> 234803…  The last 10 digits identify a Nigerian line. */
export function normalizePhone(raw) {
  const d = String(raw ?? '').replace(/\D/g, '');
  if (/^0\d{10}$/.test(d)) return '234' + d.slice(1);
  return d;
}
export const phoneKey = (raw) => normalizePhone(raw).slice(-10);

const clip = (v, n) => String(v ?? '').trim().slice(0, n);

export class DuplicateError extends Error {
  constructor() {
    super('An RSVP has already been sent with this phone number. Please use the pass link you were given, or call one of the family contacts and they will resend it.');
    this.duplicate = true;
  }
}

/** Creates a record. Guests who decline need no approval. */
export async function createRecord(input, { approved = false, source = 'guest' } = {}) {
  const id = newId();
  const attending = input.attendance !== 'declined';
  const rec = {
    id,
    fullName: clip(input.fullName, 80),
    phone: normalizePhone(input.phone),
    email: clip(input.email, 120),
    guestOf: clip(input.guestOf, 60),
    attendance: attending ? 'attending' : 'declined',
    message: clip(input.messageToCouple ?? input.message, 500),
    status: !attending ? STATUS.notAttending : approved ? STATUS.approved : STATUS.pending,
    code: '',
    source,
    createdAt: new Date().toISOString(),
    decidedAt: approved ? new Date().toISOString() : '',
  };

  // One RSVP per phone number (atomic).
  const key = phoneKey(rec.phone);
  if (key) {
    const [claimed] = await redis([['SET', `phone:${key}`, id, 'NX']]);
    if (claimed !== 'OK') throw new DuplicateError();
  }
  if (rec.status === STATUS.approved) rec.code = await claimCode(id);
  await redis([
    ['SET', `rsvp:${id}`, JSON.stringify(rec)],
    ['SADD', 'rsvps', id],
  ]);
  return rec;
}

async function claimCode(id) {
  for (let i = 0; i < 8; i++) {
    const code = makeCode();
    const [ok] = await redis([['SET', `code:${code}`, id, 'NX']]);
    if (ok === 'OK') return code;
  }
  throw new Error('Could not generate a unique access code.');
}

export async function getRecord(id) {
  if (!isValidId(id)) return null;
  const [raw] = await redis([['GET', `rsvp:${id}`]]);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function listRecords() {
  const [ids] = await redis([['SMEMBERS', 'rsvps']]);
  if (!ids?.length) return [];
  const [raws] = await redis([['MGET', ...ids.map((i) => `rsvp:${i}`)]]);
  return raws
    .map((r) => { try { return r ? JSON.parse(r) : null; } catch { return null; } })
    .filter(Boolean)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Approve / decline / put back to pending. Approval issues the access code once. */
export async function decide(id, status) {
  const rec = await getRecord(id);
  if (!rec) return null;
  if (rec.status === STATUS.notAttending) {
    const e = new Error('This guest said they are not attending, so there is nothing to approve.');
    e.client = true;
    throw e;
  }
  rec.status = status;
  rec.decidedAt = new Date().toISOString();
  if (status === STATUS.approved && !rec.code) rec.code = await claimCode(id);
  await redis([['SET', `rsvp:${id}`, JSON.stringify(rec)]]);
  return rec;
}

export async function removeRecord(id) {
  const rec = await getRecord(id);
  if (!rec) return false;
  const cmds = [['DEL', `rsvp:${id}`], ['SREM', 'rsvps', id], ['DEL', `phone:${phoneKey(rec.phone)}`]];
  if (rec.code) cmds.push(['DEL', `code:${rec.code}`]);
  await redis(cmds);
  return true;
}

/* ---------------- admin auth + rate limiting ---------------- */

const digest = (v) => crypto.createHash('sha256').update(String(v)).digest();

export const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();

/** Counts hits per ip+scope in a window. Returns true when over the limit. */
export async function tooMany(scope, ip, limit, windowSeconds) {
  if (!storeConfigured()) return false;
  try {
    const key = `rl:${scope}:${ip}`;
    const [n] = await redis([['INCR', key], ['EXPIRE', key, windowSeconds, 'NX']]);
    return Number(n) > limit;
  } catch {
    return false; // never block guests because the counter failed
  }
}

/** Returns null when the request is authorised, otherwise { status, error }. */
export async function adminGate(req) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return { status: 503, error: 'ADMIN_PASSWORD is not set on the server yet.' };
  if (!storeConfigured()) return { status: 503, error: 'The guest-list store is not connected yet.' };
  const ip = clientIp(req);
  if (await tooMany('adminfail', ip, 10, 900)) return { status: 429, error: 'Too many attempts. Try again in 15 minutes.' };
  const given = String(req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
  const ok = crypto.timingSafeEqual(digest(given), digest(password));
  if (!ok) {
    // Only failed attempts count toward the limit: undo the hit on success below.
    return { status: 401, error: 'Wrong password.' };
  }
  // Successful login: clear this ip's failure counter.
  try { await redis([['DEL', `rl:adminfail:${ip}`]]); } catch { /* ignore */ }
  return null;
}

export const parseBody = (body) => {
  if (typeof body === 'string') { try { return JSON.parse(body); } catch { return {}; } }
  return body ?? {};
};

export function cors(req, res, methods) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN ?? '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', `${methods}, OPTIONS`);
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.status(204).end(); return true; }
  return false;
}
