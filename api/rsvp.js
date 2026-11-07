/**
 * RSVP intake endpoint (Vercel).
 * One POST:
 *   1. files the request in the guest-list store as PENDING (the couple approve it
 *      from /#/admin, which issues the guest's access card), and
 *      refuses a second RSVP from the same phone number;
 *   2. also writes the response into the couple's Google Form (and its Sheet) as a backup.
 * Posting server-side lets us read Google's status code, so real errors surface
 * instead of being reported to the guest as success.
 *
 * Configure with env vars (or edit the defaults below) — see RSVP-SETUP.md.
 */
import { storeConfigured, createRecord, tooMany, clientIp, parseBody, cors, STATUS } from './_lib.js';

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
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
  // One RSVP per guest: an acceptance is always 1 seat.
  if (attending) put('seats', '1');
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
  if (cors(req, res, 'POST')) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const p = parseBody(req.body);
  // Honeypot: real guests never see or fill this field. Bots do.
  if (p.website) return res.status(200).json({ id: `rsvp_${Date.now().toString(36)}`, status: STATUS.pending });

  if (!p.fullName || String(p.fullName).trim().length < 2) return res.status(400).json({ error: 'A name is required.' });
  if (p.email && !EMAIL.test(p.email)) return res.status(400).json({ error: 'That email address looks wrong.' });
  if (String(p.phone ?? '').replace(/\D/g, '').length < 7) return res.status(400).json({ error: 'A phone number is required.' });

  const attending = p.attendance !== 'declined';
  let record = null;
  let storeProblem = '';

  if (storeConfigured()) {
    if (await tooMany('rsvp', clientIp(req), 15, 3600)) {
      return res.status(429).json({ error: 'Too many RSVPs from this connection.', problems: ['Too many RSVPs were sent from this connection. Please try again later, or call one of the family contacts.'], definitive: true });
    }
    try {
      record = await createRecord(p);
    } catch (error) {
      if (error.duplicate) {
        return res.status(409).json({ error: 'Duplicate RSVP.', problems: [error.message], definitive: true });
      }
      storeProblem = error.message;
    }
  }

  let formOk = false;
  let formError = null;
  try {
    await sendToGoogleForm(p);
    formOk = true;
  } catch (error) {
    formError = error;
  }

  if (!record && !formOk) {
    // 501 when unconfigured lets the browser fall back to its other channels.
    const problems = [];
    if (storeProblem) problems.push(`Guest list: ${storeProblem}`);
    if (formError) problems.push(`Google Form: ${formError.message}`);
    return res.status(formError?.notConfigured && !storeProblem ? 501 : 502).json({
      error: 'We could not record your RSVP.',
      problems,
      ...(formError?.definitive ? { definitive: true } : {}),
    });
  }

  return res.status(200).json({
    id: record?.id ?? `rsvp_${Date.now().toString(36)}`,
    // The private pass link token. Only present when the guest-list store recorded the RSVP.
    token: record?.id ?? null,
    status: record?.status ?? (attending ? STATUS.pending : STATUS.notAttending),
    googleForm: formOk,
  });
}
