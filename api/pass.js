/**
 * Guest pass lookup:  GET /api/pass?t=<private token>
 * Returns only what the guest needs: their name, status and (once approved) the access code.
 * Never returns phone, email or notes. The token is the unguessable id handed out at RSVP time.
 */
import { storeConfigured, getRecord, isValidId, STATUS, cors } from './_lib.js';

export default async function handler(req, res) {
  if (cors(req, res, 'GET')) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  if (!storeConfigured()) return res.status(501).json({ error: 'The guest list is not connected yet.' });

  const t = String(req.query?.t ?? '');
  if (!isValidId(t)) return res.status(404).json({ error: 'This pass link is not valid.' });

  let rec;
  try { rec = await getRecord(t); } catch { return res.status(502).json({ error: 'Could not reach the guest list. Please try again.' }); }
  if (!rec) return res.status(404).json({ error: 'This pass link is not valid.' });

  return res.status(200).json({
    status: rec.status,
    fullName: rec.fullName,
    guestOf: rec.guestOf,
    code: rec.status === STATUS.approved ? rec.code : '',
  });
}
