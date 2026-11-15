import { useEffect, useState } from 'react';
import SITE from '../data/site';
import { Reveal } from '../components/ui';
import { AccessCard, downloadCardImage } from '../components/AccessCard';
import { first } from './shared';
import { verifyCard, cryptoAvailable } from '../lib/cards';

const SAVED = 'bc-card';
const tokenFromHash = () => {
  const q = (window.location.hash.split('?')[1] || '');
  return new URLSearchParams(q).get('c') || '';
};
const recall = () => { try { return localStorage.getItem(SAVED) || ''; } catch { return ''; } };
const remember = (t) => { try { localStorage.setItem(SAVED, t); } catch { /* private mode */ } };

export default function Pass() {
  const [token, setToken] = useState(() => tokenFromHash() || recall());
  const [state, setState] = useState('loading'); // loading | none | nokey | invalid | revoked | ready
  const [pass, setPass] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Opening a different card link while this page is showing must switch to it.
  useEffect(() => {
    const onHash = () => { const t = tokenFromHash(); if (t) setToken(t); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    let live = true;
    (async () => {
      if (!token) { setState('none'); return; }
      if (!SITE.rsvp.publicKey) { setState('nokey'); return; }
      if (!cryptoAvailable()) { setState('invalid'); setError('Please open this page over https:// so your card can be checked.'); return; }
      setState('loading');
      const card = await verifyCard(SITE.rsvp.publicKey, token);
      if (!live) return;
      if (!card) { setState('invalid'); return; }
      if ((SITE.rsvp.revoked || []).includes(card.c)) { setPass({ fullName: card.n }); setState('revoked'); return; }
      remember(token);
      setPass({ fullName: card.n, guestOf: card.s, code: card.c });
      setState('ready');
    })();
    return () => { live = false; };
  }, [token]);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const save = async () => {
    setSaving(true); setError('');
    try { await downloadCardImage(pass); } catch { setError('We could not save the image. Please take a screenshot of the card instead.'); }
    setSaving(false);
  };

  const contacts = (
    <p className="form-note">Questions? Call{' '}
      {SITE.contacts.map((c, i) => <span key={c.name}>{i > 0 && ' · '}<a href={`tel:${c.tel}`}>{c.name} · {c.display}</a></span>)}
    </p>
  );

  return (
    <>
      <section className="shell page-head page-head--plain">
        <div>
          <Reveal as="p" className="eyebrow">Your access card</Reveal>
          <Reveal as="h1">{state === 'ready' ? `Welcome, ${first(pass.fullName)}` : 'Your access card'}</Reveal>
        </div>
      </section>

      <section className="section section--blush">
        <div className="shell">
          {state === 'loading' && <p className="pass-note" role="status">Checking your card…</p>}

          {state === 'none' && (
            <div className="card rsvp-card confirmation">
              <h2>No card on this phone yet</h2>
              <p>Open the personal link we send you on WhatsApp once your RSVP is approved. If you have not RSVP&rsquo;d yet, please do so first.</p>
              <a className="btn" href="#/rsvp">Go to RSVP</a>
              {contacts}
            </div>
          )}

          {state === 'nokey' && (
            <div className="card rsvp-card confirmation" role="alert">
              <h2>Cards are not switched on yet</h2>
              <p>This site cannot check access cards until the couple finish their one-time setup. Please check back soon.</p>
              {contacts}
            </div>
          )}

          {state === 'invalid' && (
            <div className="card rsvp-card confirmation" role="alert">
              <h2>This card is not valid</h2>
              <p>{error || 'Please check that you opened the complete link, exactly as we sent it. If it still does not work, call one of the family contacts and they will resend it.'}</p>
              {contacts}
            </div>
          )}

          {state === 'revoked' && (
            <div className="card rsvp-card confirmation" role="alert">
              <p className="eyebrow">Card withdrawn</p>
              <h2>This card is no longer valid</h2>
              <p>Please call one of the family contacts.</p>
              {contacts}
            </div>
          )}

          {state === 'ready' && (
            <div className="pass-wrap">
              <AccessCard pass={pass} />
              <div className="pass-actions">
                <button className="btn" type="button" onClick={save} disabled={saving}>{saving ? 'Preparing…' : 'Save card as image'}</button>
                <a className="btn btn--ghost" href="#/wedding-day">Event details</a>
              </div>
              {error && <p className="form-error is-shown" role="alert" style={{ display: 'block', textAlign: 'center' }}>{error}</p>}
              <p className="pass-hint">This card is valid for you alone. Please do not forward it.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
