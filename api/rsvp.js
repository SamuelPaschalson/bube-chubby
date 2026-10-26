/**
 * RSVP intake endpoint (Vercel / Netlify / any Node host).
 * One POST writes the response into the couple's Google Form (and its Sheet).
 * Posting server-side lets us read Google's status code, so real errors surface
 * instead of being reported to the guest as success.
 *
 * Configure with env vars (or edit the defaults below) — see RSVP-SETUP.md.
 */
const GOOGLE_FORM_ID = process.env.GOOGLE_FORM_ID ?? '1FAIpQLScfYRWaazHXNNrCgxzh09nSy4GZOSLgNg59S2A00-xmzyOJrA'; // the long id in the form URL
const ENTRIES = {
  name: process.env.GOOGLE_FORM_ENTRY_NAME ?? 'entry.786368817',
  attending: process.env.GOOGLE_FORM_ENTRY_ATTENDING ?? 'entry.1304438325',
  guestOf: process.env.GOOGLE_FORM_ENTRY_GUEST_OF ?? 'entry.1422033785',
  seats: process.env.GOOGLE_FORM_ENTRY_SEATS ?? 'entry.1799623948',
  phone: process.env.GOOGLE_FORM_ENTRY_PHONE ?? 'entry.820982805',
  email: process.env.GOOGLE_FORM_ENTRY_EMAIL ?? 'entry.1876165105',
  comments: process.env.GOOGLE_FORM_ENTRY_COMMENTS ?? 'entry.157814929',
};
// Must match the Google Form's option text exactly.
const ATTENDING = {
  attending: process.env.GOOGLE_FORM_YES ?? 'Yes',
  declined: process.env.GOOGLE_FORM_NO ?? 'No',
};
const MAX_SEATS = 2;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const parse = (body) => {
  if (typeof body === 'string') { try { return JSON.parse(body); } catch { return {}; } }
  return body ?? {};
};

async function sendToGoogleForm(p) {
  if (!GOOGLE_FORM_ID || !ENTRIES.name) {
    const e = new Error('The Google Form is not configured on the server yet.');
    e.notConfigured = true;
    throw e;
  }
  const attending = p.attendance === 'attending';
  const body = new URLSearchParams();
  const put = (k, v) => { if (ENTRIES[k]) body.set(ENTRIES[k], v ?? ''); };
  put('name', p.fullName);
  put('attending', attending ? ATTENDING.attending : ATTENDING.declined);
  put('guestOf', p.guestOf);
  if (attending) put('seats', String(Math.min(MAX_SEATS, Math.max(1, Number(p.seats) || 1))));
  put('phone', (p.phone ?? '').replace(/[^\d]/g, ''));
  put('email', p.email);
  put('comments', (p.messageToCouple ?? '').trim());
  body.set('fvv', '1');
  body.set('pageHistory', '0');

  const res = await fetch(`https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0 (compatible; wedding-site RSVP)' },
    body: body.toString(),
    redirect: 'follow',
  });
  if (res.ok || res.status === 302) return;
  if (res.status === 401 || res.status === 403) {
    const e = new Error('The form is refusing anonymous responses. In the form: Settings > Responses, set "Collect email addresses" to "Responder input" (not "Verified") and turn off "Limit to 1 response".');
    e.definitive = true;
    throw e;
  }
  const detail = (await res.text().catch(() => '')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
  throw new Error(`Google Form replied with ${res.status}.${detail ? ` Detail: ${detail}` : ''}`);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN ?? '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const p = parse(req.body);
  if (!p.fullName || String(p.fullName).trim().length < 2) return res.status(400).json({ error: 'A name is required.' });
  if (p.email && !EMAIL.test(p.email)) return res.status(400).json({ error: 'That email address looks wrong.' });
  if (p.attendance === 'attending' && Number(p.seats) > MAX_SEATS) return res.status(400).json({ error: `A maximum of ${MAX_SEATS} seats per invitation.` });

  try {
    await sendToGoogleForm(p);
  } catch (error) {
    // 501 when unconfigured lets the browser fall back to its other channels.
    return res.status(error.notConfigured ? 501 : 502).json({
      error: 'We could not record your RSVP.',
      problems: [`Google Form: ${error.message}`],
      ...(error.definitive ? { definitive: true } : {}),
    });
  }
  return res.status(200).json({ id: `rsvp_${Date.now().toString(36)}`, googleForm: true });
}
