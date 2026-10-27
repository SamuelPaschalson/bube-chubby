import SITE from '../data/site';
import { Photo, Reveal, icons } from '../components/ui';

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

/** The printed wedding invitation card (SITE.invitation). */
export function InviteCard() {
  return (
    <figure className="invite-card">
      <img src={SITE.invitation} alt={`Wedding invitation: the Agbazue and Ezepue families invite you to the wedding of ${SITE.couple.bride} and ${SITE.couple.groom}, ${SITE.date.long}, at ${SITE.events[0].venue}, Awka. Reception follows at ${SITE.events[1].venue}.`} width="771" height="1080" decoding="async" />
    </figure>
  );
}
