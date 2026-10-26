import SITE from '../../data/site';
import { RsvpSubmissionError, createId } from './types';

const form = SITE.rsvp.form;

/** Google Form field mapping. Lives in `src/data/site.js`. */
export const GOOGLE_FORM_ENTRIES = form.fields;

/** True once the couple has pasted their Google Form URL + entry ids. */
export const isGoogleFormConfigured = () => Boolean(form.action && form.fields.name);

/** Builds the `application/x-www-form-urlencoded` body Google Forms expects. */
export function buildGoogleFormBody(submission) {
  const f = GOOGLE_FORM_ENTRIES;
  const attending = submission.attendance === 'attending';
  const body = new URLSearchParams();
  const put = (key, value) => { if (f[key]) body.set(f[key], value ?? ''); };

  // Digits only: a leading '+' fails Google's Number validation with a 400.
  const digitsOnlyPhone = (submission.phone ?? '').replace(/[^\d]/g, '');

  put('name', submission.fullName);
  put('attending', attending ? form.attendingOptions.yes : form.attendingOptions.no);
  put('guestOf', submission.guestOf);
  // The form's Seats question only offers 1 or 2, so a decline leaves it blank.
  if (attending) put('seats', String(submission.seats));
  put('phone', digitsOnlyPhone);
  put('email', submission.email);
  put('comments', (submission.messageToCouple ?? '').trim());

  // Never send 'emailAddress': it forces verified-email mode (401 for guests).
  body.set('fvv', '1');
  body.set('pageHistory', '0');
  return body;
}

/**
 * Posts the RSVP straight to the couple's Google Form from the browser.
 * Google sends no CORS headers, so this uses `no-cors`: the row is written but
 * the response is unreadable. Fallback for hosts without `/api/rsvp`.
 */
export class GoogleFormRsvpService {
  constructor(action = form.action, fetchImpl = fetch.bind(globalThis)) {
    this.action = action;
    this.fetchImpl = fetchImpl;
  }

  async submit(submission) {
    if (!isGoogleFormConfigured()) throw new RsvpSubmissionError('The Google Form is not configured yet.');
    try {
      await this.fetchImpl(this.action, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: buildGoogleFormBody(submission).toString(),
      });
      return { id: createId(), submission };
    } catch (error) {
      throw new RsvpSubmissionError('We could not reach the RSVP form.', error);
    }
  }
}
