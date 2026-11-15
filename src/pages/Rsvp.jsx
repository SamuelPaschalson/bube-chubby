import { useState } from 'react';
import SITE from '../data/site';
import { Reveal } from '../components/ui';
import { ArchPhoto, first } from './shared';
import { newCode } from '../lib/cards';
import { AccessCard, downloadCardImage } from '../components/AccessCard';
import { useRsvpService } from '../features/rsvp/RsvpServiceProvider';

const MAX_PLUS = SITE.rsvp.maxPlusOnes ?? 2;
const PLUS_LABELS = ['Just me', 'Plus one', 'Plus two'];
const initial = { fullName: '', attendance: 'attending', plusOnes: '0', guestOf: '', phone: '', email: '', messageToCouple: '', website: '' };

// The guest's card stays on this phone so they can come back and save it again.
const SAVED = 'bc-rsvp-card';
const recall = () => { try { return JSON.parse(localStorage.getItem(SAVED)) || null; } catch { return null; } };
const remember = (card) => { try { localStorage.setItem(SAVED, JSON.stringify(card)); } catch { /* private mode */ } };

export default function Rsvp() {
  const service = useRsvpService();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [card, setCard] = useState(recall);
  const [status, setStatus] = useState(() => (recall() ? 'card' : 'idle')); // idle | sending | card | declined | error
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const attending = form.attendance === 'attending';

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const v = {};
    if (form.fullName.trim().length < 2) v.fullName = 'Please enter your name.';
    if (!form.guestOf) v.guestOf = 'Please tell us whose guest you are.';
    if (form.phone.replace(/\D/g, '').length < 7) v.phone = 'Please enter a valid phone / WhatsApp number.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) v.email = 'That email address looks wrong.';
    return v;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.website) return; // honeypot
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    const plusOnes = attending ? Number(form.plusOnes) : 0;
    const code = attending ? newCode() : '';
    const note = form.messageToCouple.trim();
    // Lands in the Google Form's note column, so the Sheet can be checked at the entrance.
    const comments = [code && `Access code: ${code}`, attending && `Bringing: ${PLUS_LABELS[plusOnes]}`, note && `Note: ${note}`].filter(Boolean).join('\n');
    setStatus('sending'); setError('');
    try {
      await service.submit({
        fullName: form.fullName.trim(),
        attendance: form.attendance,
        guestOf: form.guestOf,
        phone: form.phone.trim(),
        email: form.email.trim(),
        messageToCouple: note,
        seats: attending ? 1 + plusOnes : 0,
        plusOnes,
        code,
        comments,
        submittedAt: new Date().toISOString(),
      });
      if (!attending) { setStatus('declined'); return; }
      const next = { fullName: form.fullName.trim(), guestOf: form.guestOf, code, plusOnes };
      remember(next);
      setCard(next);
      setStatus('card');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'We could not send your RSVP.');
      setStatus('error');
    }
  };

  const save = async () => {
    setSaving(true); setError('');
    try { await downloadCardImage(card); } catch { setError('We could not save the image. Please take a screenshot of the card instead.'); }
    setSaving(false);
  };

  const another = () => { setForm(initial); setErrors({}); setStatus('idle'); setError(''); };

  const contacts = (
    <p className="form-note">Prefer to call?{' '}
      {SITE.contacts.map((c, i) => <span key={c.name}>{i > 0 && ' · '}<a href={`tel:${c.tel}`}>{c.name} · {c.display}</a></span>)}
    </p>
  );

  return (
    <>
      <section className="shell page-head">
        <div>
          <Reveal as="p" className="eyebrow">RSVP</Reveal>
          <Reveal as="h1">{status === 'card' ? `See you there, ${first(card.fullName)}` : 'Will you join us?'}</Reveal>
          <Reveal as="p" className="lede">{status === 'card'
            ? 'Your RSVP has been received. Below is your access card: save it to your phone and show it at the entrance, with a valid ID.'
            : `Tell us whether we will see you on ${SITE.date.short}. You may bring up to ${MAX_PLUS === 1 ? 'one guest' : `${MAX_PLUS} guests`}. Your access card appears as soon as you reply. This is an adults-only celebration.`}</Reveal>
          {status !== 'card' && SITE.rsvp.deadline && <p className="form-note">Kindly reply by <b>{SITE.rsvp.deadline}</b>.</p>}
        </div>
        <ArchPhoto src={SITE.photos.rsvp} alt="The couple laughing together" />
      </section>

      <section className="section section--blush">
        <div className="shell">
          {status === 'card' ? (
            <div className="pass-wrap">
              <AccessCard pass={card} />
              <div className="pass-actions">
                <button className="btn" type="button" onClick={save} disabled={saving}>{saving ? 'Preparing…' : 'Download my card'}</button>
                <a className="btn btn--ghost" href="#/wedding-day">Event details</a>
              </div>
              {error && <p className="form-error is-shown" role="alert" style={{ display: 'block', textAlign: 'center' }}>{error}</p>}
              <p className="pass-hint">This card admits only the number of guests shown on it. Please do not forward it.</p>
              <button className="admin-link" type="button" style={{ color: 'inherit' }} onClick={another}>RSVP for someone else</button>
            </div>
          ) : status === 'declined' ? (
            <Reveal className="card rsvp-card confirmation" role="status">
              <p className="eyebrow">RSVP received</p>
              <h2>Thank you, {first(form.fullName.trim())}.</h2>
              <p>Your reply has been received. You will be missed, and we are grateful you let us know.</p>
              <a className="btn btn--ghost" href="#/">Back to the celebration</a>
            </Reveal>
          ) : (
            <Reveal as="form" className="card rsvp-card" noValidate onSubmit={submit}>
              <div className={`field${errors.fullName ? ' has-error' : ''}`}>
                <label htmlFor="fullName">Your full name</label>
                <input id="fullName" name="fullName" type="text" value={form.fullName} onChange={change} autoComplete="name" aria-invalid={!!errors.fullName} />
                <p className="form-error">{errors.fullName}</p>
              </div>

              <fieldset className="field" style={{ border: 0, padding: 0 }}>
                <legend>Will you attend?</legend>
                <div className="choice-row">
                  <label className="choice"><input type="radio" name="attendance" value="attending" checked={attending} onChange={change} /><span>{SITE.rsvp.form.attendingOptions.yes}</span></label>
                  <label className="choice"><input type="radio" name="attendance" value="declined" checked={!attending} onChange={change} /><span>{SITE.rsvp.form.attendingOptions.no}</span></label>
                </div>
              </fieldset>

              {attending && (
                <div className="field">
                  <label htmlFor="plusOnes">Are you bringing anyone?</label>
                  <select id="plusOnes" name="plusOnes" value={form.plusOnes} onChange={change}>
                    {PLUS_LABELS.slice(0, MAX_PLUS + 1).map((l, n) => <option key={l} value={n}>{l}</option>)}
                  </select>
                </div>
              )}

              <div className={`field${errors.guestOf ? ' has-error' : ''}`}>
                <label htmlFor="guestOf">Whose guest are you?</label>
                <select id="guestOf" name="guestOf" value={form.guestOf} onChange={change} aria-invalid={!!errors.guestOf}>
                  <option value="" disabled>Select one</option>
                  {SITE.rsvp.form.guestOfOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
                <p className="form-error">{errors.guestOf}</p>
              </div>

              <div className="field-row">
                <div className={`field${errors.phone ? ' has-error' : ''}`}>
                  <label htmlFor="phone">WhatsApp / phone number</label>
                  <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="e.g. 0803 000 0000" value={form.phone} onChange={change} aria-invalid={!!errors.phone} />
                  <p className="form-error">{errors.phone}</p>
                </div>
                <div className={`field${errors.email ? ' has-error' : ''}`}>
                  <label htmlFor="email">Email <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={change} aria-invalid={!!errors.email} />
                  <p className="form-error">{errors.email}</p>
                </div>
              </div>

              <div className="field">
                <label htmlFor="messageToCouple">A note for the couple <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <textarea id="messageToCouple" name="messageToCouple" rows="4" value={form.messageToCouple} onChange={change} />
              </div>

              {/* Honeypot: invisible to people, irresistible to bots. */}
              <div className="hp" aria-hidden="true"><label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={change} /></label></div>

              {status === 'error' && <p className="form-error is-shown" role="alert" style={{ display: 'block' }}>{error} Please try again, or call one of the family contacts below.</p>}
              <button className="btn" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending your RSVP…' : attending ? 'Send RSVP & get my card' : 'Send my reply'}</button>
              {contacts}
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
