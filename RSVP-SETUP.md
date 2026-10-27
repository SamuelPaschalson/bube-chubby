# RSVP → Google Form

Every RSVP is written to the "Bube and Chubby 2027" Google Form (and its linked Sheet). WhatsApp is no longer used.

Order of delivery: `api/rsvp.js` (Vercel serverless, reads Google's status) → direct browser post to the form (works on any static host) → localStorage as a last resort.

Form questions mapped (see `rsvp.form` in `src/data/site.js` and the defaults in `api/rsvp.js`):
name, Will you attend? (Yes/No), Whose guest are you? (Grooms family / Brides family / Friends), Seats needed (the site always sends 1: every guest RSVPs individually), WhatsApp/phone, Email, Note.

Keep in the Form: Settings > Responses > "Collect email addresses" OFF, "Limit to 1 response" OFF, and don't mark "Seats needed" as required (decline replies leave it blank).
If you rename an option in the Form, change it in `site.js` too. Optional env vars for the serverless function: GOOGLE_FORM_ID, GOOGLE_FORM_ENTRY_*.
