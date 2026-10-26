import { GoogleFormRsvpService } from './googleForm';
import { RsvpSubmissionError, createId } from './types';

/**
 * Posts the RSVP to a JSON endpoint (the bundled /api/rsvp serverless
 * function by default). The only path that can read a real status code.
 */
export class HttpRsvpService {
  constructor(endpoint, fetchImpl = fetch.bind(globalThis)) {
    this.endpoint = endpoint;
    this.fetchImpl = fetchImpl;
  }

  async submit(submission) {
    try {
      const response = await this.fetchImpl(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const failure = await response.json().catch(() => null);
        const error = new RsvpSubmissionError(
          failure?.problems?.join(' ') ?? `The RSVP service replied with ${response.status}.`,
        );
        // The server read Google's real answer; do not retry blindly and fake success.
        error.definitive = Boolean(failure?.definitive);
        throw error;
      }

      const payload = await response.json().catch(() => null);
      // A static host answers 200 with HTML for unknown paths: treat as "no endpoint".
      if (!payload || typeof payload !== 'object') throw new RsvpSubmissionError('No RSVP endpoint here.');
      return { id: payload.id ?? createId(), submission };
    } catch (error) {
      if (error instanceof RsvpSubmissionError) throw error;
      throw new RsvpSubmissionError('We could not reach the RSVP service.', error);
    }
  }
}

/** Last resort so a reply is never silently dropped: queued in localStorage. */
export class LocalStorageRsvpService {
  constructor(storageKey = 'bube-chubby-rsvps', storage = globalThis.localStorage, latencyMs = 700) {
    this.storageKey = storageKey;
    this.storage = storage;
    this.latencyMs = latencyMs;
  }

  async submit(submission) {
    await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    const receipt = { id: createId(), submission };
    try {
      this.storage?.setItem(this.storageKey, JSON.stringify([...this.readAll(), receipt]));
    } catch (error) {
      throw new RsvpSubmissionError('Your browser blocked local storage.', error);
    }
    return receipt;
  }

  readAll() {
    try {
      const parsed = JSON.parse(this.storage?.getItem(this.storageKey) ?? '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

/** Tries each service in turn and returns the first receipt. `definitive` errors stop the chain. */
export class FallbackRsvpService {
  constructor(services) {
    this.services = services;
  }

  async submit(submission) {
    let lastError = null;
    for (const service of this.services) {
      try {
        return await service.submit(submission);
      } catch (error) {
        lastError = error;
        if (error?.definitive) break;
      }
    }
    throw lastError instanceof RsvpSubmissionError
      ? lastError
      : new RsvpSubmissionError('We could not record your RSVP.', lastError);
  }
}

/**
 * 1. VITE_RSVP_ENDPOINT (default /api/rsvp) — writes the Google Form row server-side.
 * 2. Direct Google Form post — for purely static hosts.
 * 3. localStorage — so nothing is ever silently lost.
 */
export function createRsvpService(endpoint = import.meta.env?.VITE_RSVP_ENDPOINT ?? 'api/rsvp') {
  const services = [];
  if (endpoint) services.push(new HttpRsvpService(endpoint));
  services.push(new GoogleFormRsvpService());
  services.push(new LocalStorageRsvpService());
  return new FallbackRsvpService(services);
}
