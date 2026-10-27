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
 * @property {number} seats     Always 1 when attending (one RSVP per guest), 0 when declining.
 * @property {string} messageToCouple
 *
 * @typedef {Object} RsvpReceipt
 * @property {string} id
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
