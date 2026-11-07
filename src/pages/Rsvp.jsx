import { useState } from 'react';
import SITE from '../data/site';
import { Reveal } from '../components/ui';
import { ArchPhoto, first } from './shared';
import { encodeRequest } from '../lib/cards';

const initial = { fullName: '', attendance: 'attending', guestOf: '', phone: '', email: '', messageToCouple: '', website: '' };

export default function Rsvp() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(null); // the prepared request, once the form is valid
  const [copied, setCopied] = useState(false);
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

  const submit = (e) => {
    e.preventDefault();
    if (form.website) return; // honeypot
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    const name = form.fullName.trim();
    const note = form.messageToCouple.trim();
    const ref = encodeRequest({ n: name, p: form.phone.trim(), s: form.guestOf, a: attending ? 1 : 0, m: note.slice(0, 300) });
    const text =
      `Hello, this is ${name}. ${attending ? `I would like to RSVP: I will be at` : `I am sorry, I will not be able to attend`} ${SITE.couple.brideShort} & ${SITE.couple.groomShort}'s wedding (${SITE.date.short}).\n\n` +
      `Name: ${name}\nWhose guest: ${form.guestOf}\nPhone: ${form.phone.trim()}` + (note ? `\nNote: ${note}` : '') +
      `\n\nRequest ref: ${ref}`;
    setSent({ text, name });
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(sent.text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { window.prompt('Copy this message', sent.text); }
  };

  return (
    <>
      <section className="shell page-head">
        <div>
          <Reveal as="p" className="eyebrow">RSVP</Reveal>
          <Reveal as="h1">Will you join us?</Reveal>
          <Reveal as="p" className="lede">Tell us whether we will see you on {SITE.date.short}. Every invited guest replies individually, and each request is checked against our guest list. Once approved, you will receive a personal digital access card, which you will need at the entrance. Please do not forward this page: requests from guests who are not on our list will not be approved. This is an adults-only celebration.</Reveal>
          {SITE.rsvp.deadline && <p className="form-note">Kindly reply by <b>{SITE.rsvp.deadline}</b>.</p>}
        </div>
        <ArchPhoto src={SITE.photos.rsvp} alt="The couple laughing together" />
      </section>

      <section className="section section--blush">
        <div className="shell">
          {sent ? (
            <Reveal className="card rsvp-card confirmation" role="status">
              <p className="eyebrow">One last step</p>
              <h2>Send your RSVP, {first(sent.name)}.</h2>
              <p>{attending
                ? 'Your request is ready. Tap a contact below to send it on WhatsApp. We will check it against our guest list and, once approved, send your personal access card back to you on the same number.'
                : 'Your reply is ready. Tap a contact below to send it on WhatsApp so we know. You will be missed.'}</p>
              <div className="btn-row" style={{ justifyContent: 'center', marginTop: 4 }}>
                {SITE.contacts.map((c) => (
                  <a key={c.name} className="btn" href={`https://wa.me/${c.wa}?text=${encodeURIComponent(sent.text)}`} target="_blank" rel="noopener noreferrer">Send to {c.name} · {c.role}</a>
                ))}
              </div>
              <button className="btn btn--ghost" type="button" onClick={copy}>{copied ? 'Copied' : 'Copy the message instead'}</button>
              <p className="pass-hint">Your RSVP only counts once the message is sent. Only guests with an approved access card will be admitted.</p>
              <button className="admin-link" type="button" style={{ color: 'inherit' }} onClick={() => setSent(null)}>Go back and edit</button>
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

              <button className="btn" type="submit">{attending ? 'Request my access card' : 'Continue'}</button>
              <p className="form-note">Prefer to call?{' '}
                {SITE.contacts.map((c, i) => <span key={c.name}>{i > 0 && ' · '}<a href={`tel:${c.tel}`}>{c.name} · {c.display}</a></span>)}
              </p>
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
