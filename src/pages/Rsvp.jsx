import { useState } from 'react';
import SITE from '../data/site';
import { Reveal } from '../components/ui';
import { ArchPhoto, first } from './shared';
import { useRsvpService } from '../features/rsvp/RsvpServiceProvider';

const initial = { fullName: '', attendance: 'attending', guestOf: '', phone: '', email: '', messageToCouple: '' };

export default function Rsvp() {
  const service = useRsvpService();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
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
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setStatus('loading'); setError('');
    try {
      await service.submit({
        ...form,
        seats: attending ? 1 : 0, // every guest replies for themselves
        submittedAt: new Date().toISOString(),
      });
      setStatus('success');
    } catch (err) {
      setError(err.message); setStatus('error');
    }
  };

  return (
    <>
      <section className="shell page-head">
        <div>
          <Reveal as="p" className="eyebrow">RSVP</Reveal>
          <Reveal as="h1">Will you join us?</Reveal>
          <Reveal as="p" className="lede">Tell us whether we will see you on {SITE.date.short}. Every invited guest replies individually, so each person sends their own RSVP. This is an adults-only celebration.</Reveal>
          {SITE.rsvp.deadline && <p className="form-note">Kindly reply by <b>{SITE.rsvp.deadline}</b>.</p>}
        </div>
        <ArchPhoto src={SITE.photos.rsvp} alt="The couple laughing together" />
      </section>

      <section className="section section--blush">
        <div className="shell">
          {status === 'success' ? (
            <Reveal className="card rsvp-card confirmation" role="status">
              <p className="eyebrow">RSVP received</p>
              <h2>Thank you, {first(form.fullName.trim())}.</h2>
              <p>{attending ? 'Your RSVP has been received. We cannot wait to celebrate with you.' : 'Your reply has been received. You will be missed, and we are grateful you let us know.'}</p>
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

              {error && <p className="form-error is-shown" role="alert" style={{ display: 'block' }}>{error}</p>}
              <button className="btn" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Sending your reply…' : 'Send RSVP'}</button>
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
