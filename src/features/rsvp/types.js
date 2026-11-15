/** RSVP domain types. Framework-agnostic on purpose. */

/**
 * @typedef {'attending' | 'declined'} Attendance
 *
 * @typedef {Object} RsvpSubmission
 * @property {string} fullName
 * @property {string} phone
 * @property {string} email
 * @property {Attendance} attendance
 * @property {string} guestOf   Which family contact the guest belongs to (e.g. "Okey · Ezepue family").
 * @property {number} seats     1 + the number of plus-ones when attending, 0 when declining.
 * @property {number} plusOnes  How many guests they bring: 0, 1 or 2 (up to SITE.rsvp.maxPlusOnes).
 * @property {string} code      The access code shown on the guest's card.
 * @property {string} messageToCouple
 * @property {string} comments  What goes in the Google Form's note column (code, plus-ones, note).
 *
 * @typedef {Object} RsvpReceipt
 * @property {string} id
 * @property {string|null} [token]   Private pass-link id. Present once the guest-list store has the RSVP.
 * @property {'pending'|'approved'|'declined'|'not_attending'|null} [status]
 * @property {RsvpSubmission} submission
 *
 * @typedef {Object} RsvpService
 * @property {(submission: RsvpSubmission) => Promise<RsvpReceipt>} submit
 */

export class RsvpSubmissionError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'RsvpSubmissionError';
    this.cause = cause;
  }
}

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `rsvp_${Date.now().toString(36)}`;
}
