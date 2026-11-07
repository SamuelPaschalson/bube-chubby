/**
 * Couple-only guest list management:  POST /api/admin   (Authorization: Bearer <ADMIN_PASSWORD>)
 *   { action: 'list' }
 *   { action: 'decide', id, status: 'approved' | 'declined' | 'pending' }
 *   { action: 'add', fullName, phone, guestOf, email? }   // a guest who called: approved straight away
 *   { action: 'delete', id }
 */
import { adminGate, listRecords, decide, createRecord, removeRecord, parseBody, cors, STATUS } from './_lib.js';

const DECISIONS = [STATUS.approved, STATUS.declined, STATUS.pending];

export default async function handler(req, res) {
  if (cors(req, res, 'POST')) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const blocked = await adminGate(req);
  if (blocked) return res.status(blocked.status).json({ error: blocked.error });

  const b = parseBody(req.body);
  try {
    switch (b.action) {
      case 'list':
        return res.status(200).json({ records: await listRecords() });

      case 'decide': {
        if (!DECISIONS.includes(b.status)) return res.status(400).json({ error: 'Unknown status.' });
        const rec = await decide(String(b.id ?? ''), b.status);
        if (!rec) return res.status(404).json({ error: 'That RSVP no longer exists.' });
        return res.status(200).json({ record: rec });
      }

      case 'add': {
        if (String(b.fullName ?? '').trim().length < 2) return res.status(400).json({ error: 'A name is required.' });
        if (String(b.phone ?? '').replace(/\D/g, '').length < 7) return res.status(400).json({ error: 'A phone number is required.' });
        const rec = await createRecord({ ...b, attendance: 'attending' }, { approved: true, source: 'couple' });
        return res.status(200).json({ record: rec });
      }

      case 'delete': {
        const ok = await removeRecord(String(b.id ?? ''));
        return res.status(ok ? 200 : 404).json(ok ? { ok: true } : { error: 'That RSVP no longer exists.' });
      }

      default:
        return res.status(400).json({ error: 'Unknown action.' });
    }
  } catch (error) {
    if (error.duplicate) return res.status(409).json({ error: error.message });
    if (error.client) return res.status(400).json({ error: error.message });
    return res.status(502).json({ error: error.message || 'Something went wrong.' });
  }
}
