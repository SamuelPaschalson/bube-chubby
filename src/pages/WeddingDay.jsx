import SITE from '../data/site';
import { Reveal } from '../components/ui';
import { EventCard, Swatches, InviteCard } from './shared';

export default function WeddingDay() {
  const [e1, e2] = SITE.events;
  return (
    <>
      <section className="shell page-head">
        <div>
          <Reveal as="p" className="eyebrow">The wedding day</Reveal>
          <Reveal as="h1">One Saturday,<br />two beginnings</Reveal>
          <Reveal as="p" className="lede">{SITE.date.long}. We will say “I do” at noon in {SITE.date.city.split(',')[0]}, then celebrate from 3:00 pm at the reception at {e2.venue}. This is an adults-only wedding. Everything you need is on this page.</Reveal>
          <Reveal className="btn-row">
            <button type="button" className="btn" onClick={() => window.print()}>Print the invitation</button>
            <a className="btn btn--ghost" href="#/rsvp">RSVP</a>
          </Reveal>
        </div>
        <Reveal className="invite-frame"><InviteCard /></Reveal>
      </section>

      <section className="section section--blush">
        <div className="shell grid-2"><EventCard e={e1} full /><EventCard e={e2} full /></div>
      </section>

      <section className="section section--plum">
        <div className="shell">
          <div className="center" style={{ marginBottom: 'clamp(24px,4vw,44px)' }}>
            <Reveal as="p" className="eyebrow">The day at a glance</Reveal>
            <Reveal as="h2" style={{ marginTop: 12 }}>How it unfolds</Reveal>
          </div>
          <Reveal as="ol" className="glance">
            <li><time>12:00 noon</time><div><b>Wedding ceremony</b><span>{e1.venue}, {e1.address}. Please be seated before noon; we begin promptly.</span></div></li>
            <li><time>3:00 pm</time><div><b>Reception</b><span>{e2.venue}, {e2.address}. Food, toasts, the first dance and a very long night of music. Adults only, please.</span></div></li>
          </Reveal>
        </div>
      </section>

      <section className="section center">
        <div className="shell">
          <Reveal as="p" className="eyebrow">Colours of the day</Reveal>
          <Reveal as="h2" style={{ marginTop: 12 }}>Dress to match the room</Reveal>
          <Swatches />
          <div className="btn-row"><Reveal as="a" className="btn btn--ghost" href="#/guest-guide">Read the guest guide</Reveal></div>
        </div>
      </section>
    </>
  );
}
