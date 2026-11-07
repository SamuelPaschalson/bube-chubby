import { useEffect, useState } from 'react';
import SITE from '../data/site';
import { Monogram, Reveal } from '../components/ui';
import { first } from './shared';
import { verifyCard, cryptoAvailable } from '../lib/cards';

const SAVED = 'bc-card';
const tokenFromHash = () => {
  const q = (window.location.hash.split('?')[1] || '');
  return new URLSearchParams(q).get('c') || '';
};
const recall = () => { try { return localStorage.getItem(SAVED) || ''; } catch { return ''; } };
const remember = (t) => { try { localStorage.setItem(SAVED, t); } catch { /* private mode */ } };

/* ---------- the card, as the guest sees it ---------- */
function AccessCard({ pass }) {
  const [ceremony, reception] = SITE.events;
  return (
    <article className="pass-card" aria-label={`Access card for ${pass.fullName}`}>
      <div className="pass-card__frame">
        <Monogram size={78} />
        <p className="pass-card__kind">Access Card</p>
        <p className="pass-card__names">{SITE.couple.brideShort} &amp; {SITE.couple.groomShort}</p>
        <p className="pass-card__date">{SITE.date.long}</p>
        <hr className="rule" />
        <p className="pass-card__admit">Admit</p>
        <p className="pass-card__guest">{pass.fullName}</p>
        {pass.guestOf && <p className="pass-card__of">{pass.guestOf}</p>}
        <p className="pass-card__one">One named guest only</p>
        <div className="pass-card__code"><small>Access code</small><b>{pass.code}</b></div>
        <dl className="pass-card__events">
          <div><dt>{ceremony.title}</dt><dd>{ceremony.time}<br />{ceremony.venue}</dd></div>
          <div><dt>{reception.title}</dt><dd>{reception.time}<br />{reception.venue}</dd></div>
        </dl>
        <p className="pass-card__fine">Please keep this card on your phone and show it at the entrance, with a valid ID. It is personal and cannot be shared or transferred.</p>
      </div>
    </article>
  );
}

/* ---------- save the card as a picture (drawn on a canvas so it works offline) ---------- */
async function downloadCardImage(pass) {
  const W = 1080, H = 1620;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  try {
    await Promise.all([
      document.fonts.load("600 64px 'Cormorant Garamond'"),
      document.fonts.load("400 90px 'Pinyon Script'"),
      document.fonts.load("500 30px 'Jost'"),
    ]);
  } catch { /* fall back to the system serif */ }

  const SERIF = "'Cormorant Garamond', Georgia, serif";
  const SCRIPT = "'Pinyon Script', 'Snell Roundhand', cursive";
  const SANS = "'Jost', 'Helvetica Neue', Arial, sans-serif";
  const gold = '#b98a45', wine = '#6e2c45', mauve = '#8e5a63', ink = '#3b2530';

  // paper
  const bg = c.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#fcf7f1'); bg.addColorStop(1, '#f8e9e4');
  c.fillStyle = bg; c.fillRect(0, 0, W, H);
  c.strokeStyle = gold; c.lineWidth = 3; c.strokeRect(34, 34, W - 68, H - 68);
  c.lineWidth = 1; c.strokeRect(50, 50, W - 100, H - 100);

  c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const spaced = (text, y, spacing) => {
    // manual letter-spacing: ctx.letterSpacing is not in every browser
    const chars = [...text];
    const widths = chars.map((ch) => c.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
    let x = W / 2 - total / 2;
    c.textAlign = 'left';
    chars.forEach((ch, i) => { c.fillText(ch, x, y); x += widths[i] + spacing; });
    c.textAlign = 'center';
  };
  const fit = (text, maxWidth, size, weight, family) => {
    let s = size;
    c.font = `${weight} ${s}px ${family}`;
    while (c.measureText(text).width > maxWidth && s > 28) { s -= 2; c.font = `${weight} ${s}px ${family}`; }
    return s;
  };

  // monogram ring
  c.strokeStyle = gold; c.lineWidth = 3;
  c.beginPath(); c.arc(W / 2, 205, 74, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 1.2; c.beginPath(); c.arc(W / 2, 205, 66, 0, Math.PI * 2); c.stroke();
  c.fillStyle = gold; c.font = `600 66px ${SERIF}`;
  c.fillText('B  C', W / 2, 228);

  c.fillStyle = mauve; c.font = `500 24px ${SANS}`;
  spaced('ACCESS CARD', 336, 9);

  c.fillStyle = wine;
  fit(`${SITE.couple.brideShort} & ${SITE.couple.groomShort}`, W - 200, 112, 400, SCRIPT);
  c.fillText(`${SITE.couple.brideShort} & ${SITE.couple.groomShort}`, W / 2, 462);

  c.fillStyle = ink; c.font = `500 36px ${SERIF}`;
  c.fillText(SITE.date.long, W / 2, 530);

  c.strokeStyle = gold; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(W / 2 - 110, 584); c.lineTo(W / 2 + 110, 584); c.stroke();

  c.fillStyle = mauve; c.font = `500 24px ${SANS}`;
  spaced('ADMIT', 662, 10);

  c.fillStyle = wine;
  fit(pass.fullName, W - 220, 92, 600, SERIF);
  c.fillText(pass.fullName, W / 2, 770);

  if (pass.guestOf) { c.fillStyle = mauve; c.font = `italic 400 34px ${SERIF}`; c.fillText(pass.guestOf, W / 2, 826); }
  c.fillStyle = mauve; c.font = `500 22px ${SANS}`;
  spaced('ONE NAMED GUEST ONLY', 884, 7);

  // code box
  const bx = 190, by = 940, bw = W - 380, bh = 170;
  c.fillStyle = '#fffdfb'; c.fillRect(bx, by, bw, bh);
  c.strokeStyle = gold; c.lineWidth = 2; c.strokeRect(bx, by, bw, bh);
  c.fillStyle = mauve; c.font = `500 21px ${SANS}`;
  spaced('ACCESS CODE', by + 54, 7);
  c.fillStyle = wine; c.font = `500 66px ${SANS}`;
  spaced(pass.code, by + 128, 9);

  // events
  const [ceremony, reception] = SITE.events;
  [[ceremony, 1190], [reception, 1300]].forEach(([e, y]) => {
    c.fillStyle = mauve; c.font = `500 21px ${SANS}`;
    spaced(e.title.toUpperCase(), y, 6);
    c.fillStyle = ink; c.font = `500 32px ${SERIF}`;
    c.fillText(`${e.time}  ·  ${e.venue}`, W / 2, y + 44);
  });

  c.fillStyle = ink; c.globalAlpha = 0.7; c.font = `400 25px ${SANS}`;
  ['Keep this card on your phone and show it at the entrance, with a valid ID.', 'It is personal and cannot be shared or transferred.']
    .forEach((line, i) => c.fillText(line, W / 2, 1450 + i * 40));
  c.globalAlpha = 1;

  const blob = await new Promise((resolve) => cv.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Could not make the image.');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `access-card-${pass.fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

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
