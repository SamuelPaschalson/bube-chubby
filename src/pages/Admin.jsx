import { useEffect, useMemo, useState } from 'react';
import SITE from '../data/site';
import { Reveal } from '../components/ui';
import { first } from './shared';
import {
  cryptoAvailable, generateKeys, publicFromPrivate, samePublicKey,
  signCard, newCode, decodeRequest, normalizePhone, phoneKey,
} from '../lib/cards';

/**
 * The couple's page. Everything happens in this browser: the private key and the list of
 * issued cards are kept in localStorage on THEIR phone, and a backup file moves them to another device.
 */
const KEY = 'bc-admin-key';
const LEDGER = 'bc-ledger';
const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

const passLink = (token) => `${window.location.origin}${window.location.pathname}#/pass?c=${token}`;

function whatsappLink(entry) {
  const text =
    `Hello ${first(entry.name)}, your RSVP for ${SITE.couple.brideShort} & ${SITE.couple.groomShort}'s wedding (${SITE.date.short}) has been approved 🎉\n\n` +
    `Here is your personal access card. Please keep it on your phone and show it at the entrance:\n${passLink(entry.token)}\n\n` +
    `It is for you alone, so please do not forward it.`;
  return `https://wa.me/${normalizePhone(entry.phone)}?text=${encodeURIComponent(text)}`;
}

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
function download(name, type, content) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
const today = () => new Date().toISOString().slice(0, 10);
const when = (iso) => { try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); } catch { return ''; } };

function CopyButton({ text, label = 'Copy', className = 'btn btn--ghost btn--sm' }) {
  const [done, setDone] = useState(false);
  const go = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800); } catch { window.prompt('Copy this', text); }
  };
  return <button type="button" className={className} onClick={go}>{done ? 'Copied' : label}</button>;
}

/* ---------- first visit: make or restore the key ---------- */
function Setup({ onKey, onRestore }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const create = async () => {
    setBusy(true); setErr('');
    try { onKey((await generateKeys()).privateKey); } catch { setErr('Could not create the key on this device.'); }
    setBusy(false);
  };
  const restore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { await onRestore(JSON.parse(await file.text())); } catch { setErr('That does not look like a Guest List backup file.'); }
    e.target.value = '';
  };
  return (
    <Reveal className="card rsvp-card">
      <p className="eyebrow">One-time setup</p>
      <h2 style={{ marginBlock: '8px 12px' }}>Create your signing key</h2>
      <p>This key is what makes an access card real. It stays on this phone only: nothing is uploaded anywhere. Make it once, on the phone you will use to approve guests.</p>
      {err && <p className="form-error is-shown" role="alert" style={{ display: 'block' }}>{err}</p>}
      <div className="admin-row-actions" style={{ marginTop: 22 }}>
        <button className="btn" type="button" onClick={create} disabled={busy || !cryptoAvailable()}>{busy ? 'Creating…' : 'Create our key'}</button>
        <label className="btn btn--ghost" style={{ cursor: 'pointer' }}>
          Restore from backup
          <input type="file" accept="application/json,.json" onChange={restore} style={{ display: 'none' }} />
        </label>
      </div>
      {!cryptoAvailable() && <p className="form-error is-shown" style={{ display: 'block' }}>This page must be opened over https:// (or localhost) for keys to work.</p>}
    </Reveal>
  );
}

export default function Admin() {
  const [priv, setPriv] = useState(() => read(KEY, null));
  const [ledger, setLedger] = useState(() => read(LEDGER, []));
  const [paste, setPaste] = useState('');
  const [request, setRequest] = useState(null);
  const [pasteErr, setPasteErr] = useState('');
  const [f, setF] = useState({ name: '', phone: '', side: '' });
  const [formErr, setFormErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const pub = useMemo(() => (priv ? publicFromPrivate(priv) : null), [priv]);
  const siteReady = pub && samePublicKey(pub, SITE.rsvp.publicKey);
  const saveLedger = (next) => { setLedger(next); write(LEDGER, next); };
  const setKey = (k) => { write(KEY, k); setPriv(k); };

  const parsePaste = (text) => {
    setPaste(text); setPasteErr('');
    if (!text.trim()) { setRequest(null); return; }
    const r = decodeRequest(text);
    if (!r) { setRequest(null); setPasteErr('That does not look like an RSVP message. Paste the whole message the guest sent.'); return; }
    setRequest(r);
    if (r.a) setF({ name: r.n, phone: r.p || '', side: r.s || '' });
  };

  const issue = async (e) => {
    e.preventDefault();
    setFormErr('');
    const name = f.name.trim();
    if (name.length < 2) return setFormErr('Please enter the guest’s name.');
    if (f.phone.replace(/\D/g, '').length < 7) return setFormErr('Please enter their WhatsApp number.');
    const dupe = ledger.find((x) => !x.revoked && phoneKey(x.phone) === phoneKey(f.phone));
    if (dupe && !window.confirm(`${dupe.name} (${dupe.phone}) already has a card. Issue another one for this number?`)) return;
    setBusy(true);
    try {
      const code = newCode();
      const token = await signCard(priv, { n: name, c: code, s: f.side });
      saveLedger([{ code, token, name, phone: normalizePhone(f.phone), side: f.side, issuedAt: new Date().toISOString(), revoked: false }, ...ledger]);
      setF({ name: '', phone: '', side: '' }); setRequest(null); setPaste('');
    } catch { setFormErr('Could not sign the card. Please try again.'); }
    setBusy(false);
  };

  const toggleRevoke = (code) => saveLedger(ledger.map((x) => (x.code === code ? { ...x, revoked: !x.revoked } : x)));
  const remove = (x) => { if (window.confirm(`Remove ${x.name} from your list? Their card will still work unless you revoked it first.`)) saveLedger(ledger.filter((y) => y.code !== x.code)); };

  const backup = () => download(`guest-list-backup-${today()}.json`, 'application/json', JSON.stringify({ app: 'bube-chubby', version: 1, privateKey: priv, ledger }, null, 2));
  const restore = async (data) => {
    if (!data?.privateKey?.d) throw new Error('bad');
    setKey(data.privateKey);
    saveLedger(Array.isArray(data.ledger) ? data.ledger : []);
  };
  const csv = () => {
    const head = ['Name', 'Whose guest', 'Phone', 'Access code', 'Status', 'Issued'];
    const rows = ledger.map((x) => [x.name, x.side, x.phone, x.code, x.revoked ? 'revoked' : 'valid', x.issuedAt]);
    download(`guest-list-${today()}.csv`, 'text/csv;charset=utf-8', '\ufeff' + [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n'));
  };
  const forget = () => {
    if (!window.confirm('Remove the signing key and list from this phone? Make sure you have downloaded a backup first, or you will not be able to issue cards again.')) return;
    try { localStorage.removeItem(KEY); localStorage.removeItem(LEDGER); } catch { /* ignore */ }
    setPriv(null); setLedger([]);
  };

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return ledger.filter((x) => !n || `${x.name} ${x.phone} ${x.code} ${x.side}`.toLowerCase().includes(n));
  }, [ledger, q]);
  const revokedCodes = ledger.filter((x) => x.revoked).map((x) => x.code);
  const published = new Set(SITE.rsvp.revoked || []);
  const unpublished = revokedCodes.filter((c) => !published.has(c));
  const keySnippet = pub ? `publicKey: ${JSON.stringify(pub)},` : '';
  const revokedSnippet = `revoked: ${JSON.stringify(revokedCodes)},`;
  const set = (e) => setF({ ...f, [e.target.name]: e.target.value });

  return (
    <>
      <section className="shell page-head page-head--plain">
        <div>
          <Reveal as="p" className="eyebrow">Just for the two of you</Reveal>
          <Reveal as="h1">The guest list</Reveal>
          {priv && <Reveal as="p" className="lede">Paste a guest&rsquo;s RSVP, issue their access card, and send it back on WhatsApp.</Reveal>}
        </div>
      </section>

      <section className="section section--blush">
        <div className="shell admin">
          {!priv ? (
            <Setup onKey={setKey} onRestore={restore} />
          ) : (
            <>
              {siteReady ? (
                <p className="admin-banner is-ok">Your site is set up and will accept the cards you issue.</p>
              ) : (
                <div className="admin-banner is-warn">
                  <p><b>One more step before cards work.</b> Paste this line into <code>src/data/site.js</code> (inside <code>rsvp</code>, replacing <code>publicKey: null,</code>) and redeploy. It is safe to share: it can only check cards, not make them.</p>
                  <pre>{keySnippet}</pre>
                  <CopyButton text={keySnippet} label="Copy the line" />
                </div>
              )}

              <div className="card admin-issue">
                <p className="eyebrow">Approve a guest</p>
                <div className="field">
                  <label htmlFor="paste">Paste the guest&rsquo;s WhatsApp request (optional)</label>
                  <textarea id="paste" rows="3" value={paste} onChange={(e) => parsePaste(e.target.value)} placeholder="Paste the whole message here and the form below fills itself in" />
                  {pasteErr && <p className="form-error is-shown" style={{ display: 'block' }}>{pasteErr}</p>}
                  {request && request.a === 1 && <p className="admin-ok">Request from <b>{request.n}</b>{request.s ? ` · ${request.s}` : ''}. Check them against your list, then issue the card.{request.m ? ` Note: “${request.m}”` : ''}</p>}
                  {request && request.a === 0 && <p className="admin-ok"><b>{request.n}</b> will not be attending. No card needed.</p>}
                </div>
                <form onSubmit={issue} noValidate>
                  <div className="field-row">
                    <div className="field"><label htmlFor="g-name">Full name (as it will appear on the card)</label><input id="g-name" name="name" type="text" value={f.name} onChange={set} /></div>
                    <div className="field"><label htmlFor="g-phone">WhatsApp / phone</label><input id="g-phone" name="phone" type="tel" value={f.phone} onChange={set} /></div>
                  </div>
                  <div className="field">
                    <label htmlFor="g-side">Whose guest</label>
                    <select id="g-side" name="side" value={f.side} onChange={set}>
                      <option value="">Select one</option>
                      {SITE.rsvp.form.guestOfOptions.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  {formErr && <p className="form-error is-shown" role="alert" style={{ display: 'block' }}>{formErr}</p>}
                  <button className="btn" type="submit" disabled={busy}>{busy ? 'Signing…' : 'Issue access card'}</button>
                </form>
              </div>

              <div className="admin-stats" role="list" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div role="listitem"><b>{ledger.filter((x) => !x.revoked).length}</b><span>cards issued</span></div>
                <div role="listitem"><b>{revokedCodes.length}</b><span>revoked</span></div>
              </div>
              <div className="admin-bar">
                <p className="eyebrow" style={{ margin: 0 }}>Cards you have issued</p>
                <input className="admin-search" type="search" placeholder="Search name, phone or code" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search issued cards" />
              </div>
              {shown.length ? (
                <ul className="admin-list">
                  {shown.map((x) => (
                    <li key={x.code} className={`admin-row ${x.revoked ? 'is-declined' : 'is-approved'}`}>
                      <div className="admin-row__main">
                        <p className="admin-row__name">{x.name}{x.revoked && <span className="chip chip--soft">revoked</span>}</p>
                        <p className="admin-row__meta">{x.side || 'No side chosen'} · {x.phone} · issued {when(x.issuedAt)}</p>
                        <p className="admin-row__code">Code {x.code}</p>
                      </div>
                      <div className="admin-row__actions">
                        {!x.revoked && <a className="btn btn--sm" href={whatsappLink(x)} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>}
                        {!x.revoked && <CopyButton text={passLink(x.token)} label="Copy link" />}
                        <button className="btn btn--ghost btn--sm" onClick={() => toggleRevoke(x.code)}>{x.revoked ? 'Restore' : 'Revoke'}</button>
                        <button className="admin-link" onClick={() => remove(x)}>Remove</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pass-note">{ledger.length ? 'Nothing matches.' : 'No cards issued yet.'}</p>
              )}

              {unpublished.length > 0 && (
                <div className="admin-banner is-warn">
                  <p><b>Revoking takes effect once published.</b> Put this line in <code>src/data/site.js</code> (inside <code>rsvp</code>, replacing the <code>revoked</code> line) and redeploy. Until then the card still opens.</p>
                  <pre>{revokedSnippet}</pre>
                  <CopyButton text={revokedSnippet} label="Copy the line" />
                </div>
              )}

              <div className="admin-tools">
                <button className="btn btn--ghost" type="button" onClick={backup}>Download backup</button>
                <label className="btn btn--ghost" style={{ cursor: 'pointer' }}>
                  Restore backup
                  <input type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={async (e) => { const file = e.target.files?.[0]; if (file) { try { await restore(JSON.parse(await file.text())); } catch { window.alert('That is not a valid backup file.'); } } e.target.value = ''; }} />
                </label>
                <button className="btn btn--ghost" type="button" onClick={csv}>Download CSV</button>
                <button className="admin-link" type="button" onClick={forget}>Remove key from this phone</button>
              </div>
              <p className="pass-hint" style={{ marginTop: 22, textAlign: 'left' }}>
                Download a backup now and keep it safe (it holds your signing key, so do not share it). Open the backup on your partner&rsquo;s phone with &ldquo;Restore backup&rdquo; so both of you can approve guests.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
