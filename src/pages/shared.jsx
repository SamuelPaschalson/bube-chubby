import SITE from '../data/site';
import { Monogram, Photo, Reveal, icons } from '../components/ui';

export const first = (s) => s.split(' ')[0];

export function EventCard({ e, full = false }) {
  return (
    <Reveal as="article" className="card">
      <div className="icon">{e.id === 'ceremony' ? icons.church : icons.glasses}</div>
      <p className="eyebrow">{e.label}</p>
      <h3>{e.title}</h3>
      <dl>
        <dt>Date</dt><dd>{SITE.date.long}</dd>
        <dt>Time</dt><dd>{e.time}</dd>
        <dt>Venue</dt><dd>{e.venue}<br />{e.address}</dd>
      </dl>
      {full && <p className="card-note">{e.note}</p>}
      <a className="btn btn--ghost" href={e.map} target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
    </Reveal>
  );
}

export function Swatches() {
  return (
    <div className="swatches">
      {SITE.palette.map((c, i) => (
        <Reveal className="swatch" delay={i * 0.12} key={c.name}>
          <i style={{ background: c.hex }} /><b>{c.name}</b><small>{c.hex}</small>
        </Reveal>
      ))}
    </div>
  );
}

export function Contacts() {
  return (
    <div className="contact-grid">
      {SITE.contacts.map((c) => (
        <Reveal className="contact" key={c.name}>
          <div className="role">{c.role}</div><div className="name">{c.name}</div>
          <a href={`tel:${c.tel}`}>{icons.phone}{c.display}</a>
        </Reveal>
      ))}
    </div>
  );
}

export const ArchPhoto = ({ src, alt }) => (
  <Reveal className="arch"><Photo src={src} alt={alt} eager /></Reveal>
);

/** The wedding invitation, drawn in code so it always matches the site's details. */
export function InviteCard() {
  const [e1, e2] = SITE.events;
  return (
    <div className="invite-card" role="img" aria-label={`Wedding invitation for ${SITE.couple.bride} and ${SITE.couple.groom}, ${SITE.date.long}`}>
      <div className="ic-inner">
        <Monogram size={64} />
        <p className="ic-pre">The Agbazue &amp; Ezepue families<br />cordially invite you to the wedding of their children</p>
        <p className="ic-name">{SITE.couple.bride}</p>
        <p className="ic-amp">&amp;</p>
        <p className="ic-name">{SITE.couple.groom}</p>
        <hr className="ic-rule" />
        <p className="ic-date">{SITE.date.long}</p>
        <div className="ic-cols">
          <div><b>Ceremony</b><span>{e1.time}</span><span>{e1.venue}</span></div>
          <div><b>Reception</b><span>{e2.time}</span><span>{e2.venue}</span></div>
        </div>
        <p className="ic-city">{SITE.date.city}</p>
        <p className="ic-adults">Adults only &middot; no children&rsquo;s party</p>
        <p className="ic-colours">Colours of the day: {SITE.palette.map((c) => c.name).join(' · ')}</p>
      </div>
    </div>
  );
}
