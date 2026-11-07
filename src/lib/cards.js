/**
 * Signed access cards: no server, no database.
 *
 *  - The couple generate an ECDSA key pair once (Guest List page). The PRIVATE key never
 *    leaves their device. The PUBLIC key is pasted into src/data/site.js (rsvp.publicKey).
 *  - Approving a guest = signing {name, code, side} with the private key. The result is a
 *    link: #/pass?c=<payload>.<signature>
 *  - The Pass page verifies the signature against the public key in the site. A card that
 *    was edited, or invented by someone else, cannot verify, so it shows nothing.
 *  - Guests' RSVP requests travel by WhatsApp (a prefilled message to the family contact).
 * Needs WebCrypto, which browsers only provide on https:// or localhost.
 */
const te = new TextEncoder();
const td = new TextDecoder();
const ALGO = { name: 'ECDSA', namedCurve: 'P-256' };
const SIGN = { name: 'ECDSA', hash: 'SHA-256' };

export const b64u = {
  enc(bytes) {
    let s = '';
    new Uint8Array(bytes).forEach((b) => { s += String.fromCharCode(b); });
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  dec(str) {
    let s = String(str).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  },
};
const encodeJson = (obj) => b64u.enc(te.encode(JSON.stringify(obj)));
const decodeJson = (str) => JSON.parse(td.decode(b64u.dec(str)));

export const cryptoAvailable = () => Boolean(globalThis.crypto?.subtle);

/** New key pair: { privateKey, publicKey } as JWK objects. */
export async function generateKeys() {
  const pair = await crypto.subtle.generateKey(ALGO, true, ['sign', 'verify']);
  const privateKey = await crypto.subtle.exportKey('jwk', pair.privateKey);
  const pub = await crypto.subtle.exportKey('jwk', pair.publicKey);
  return { privateKey, publicKey: { kty: pub.kty, crv: pub.crv, x: pub.x, y: pub.y } };
}

export const publicFromPrivate = (priv) => ({ kty: priv.kty, crv: priv.crv, x: priv.x, y: priv.y });
export const samePublicKey = (a, b) => Boolean(a && b && a.x === b.x && a.y === b.y);

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L
export function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return 'BC-' + Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

/** Signs a card. `card` = { n: name, c: code, s: side }. Returns "<payload>.<signature>". */
export async function signCard(privateJwk, card) {
  const key = await crypto.subtle.importKey('jwk', privateJwk, ALGO, false, ['sign']);
  const payload = encodeJson({ v: 1, ...card });
  const sig = await crypto.subtle.sign(SIGN, key, te.encode(payload));
  return `${payload}.${b64u.enc(sig)}`;
}

/** Returns the card ({n,c,s}) when the signature is genuine, otherwise null. */
export async function verifyCard(publicJwk, token) {
  try {
    const [payload, sig] = String(token).trim().split('.');
    if (!payload || !sig) return null;
    const key = await crypto.subtle.importKey('jwk', publicJwk, ALGO, false, ['verify']);
    const ok = await crypto.subtle.verify(SIGN, key, b64u.dec(sig), te.encode(payload));
    if (!ok) return null;
    const card = decodeJson(payload);
    return card?.n && card?.c ? card : null;
  } catch {
    return null;
  }
}

/* ---------- RSVP requests (guest -> couple, by WhatsApp) ---------- */
export const encodeRequest = (req) => encodeJson(req);
export function decodeRequest(text) {
  const m = String(text).match(/Request ref:\s*([A-Za-z0-9_-]+)/) || [null, String(text).trim()];
  try {
    const r = decodeJson(m[1]);
    return r?.n ? r : null;
  } catch {
    return null;
  }
}

/** Digits only; 0803… -> 234803…  */
export function normalizePhone(raw) {
  const d = String(raw ?? '').replace(/\D/g, '');
  return /^0\d{10}$/.test(d) ? '234' + d.slice(1) : d;
}
export const phoneKey = (raw) => normalizePhone(raw).slice(-10);
