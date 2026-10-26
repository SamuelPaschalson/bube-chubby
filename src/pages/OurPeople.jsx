import { useState } from 'react';
import SITE from '../data/site';
import { Monogram, Reveal } from '../components/ui';
import { ArchPhoto } from './shared';

function Person({ p }) {
  const [n, setN] = useState(0);
  const none = p.photos.length === 0;
  const many = p.photos.length > 1;
  const imgs = p.photos.map((src, i) => <img key={src} style={p.focus ? { objectPosition: p.focus } : undefined} className={i === n ? 'on' : ''} src={src} alt={i === n ? (p.name || p.role) : ''} loading="lazy" decoding="async" />);
  return (
    <Reveal className={`person ${many ? 'has-many' : ''}`}>
      {none
        ? <div className="arch arch--mono"><Monogram size={110} /><small>Portrait<br />coming soon</small></div>
        : many
        ? <button type="button" className="arch" aria-label={`Show another photo of ${p.name || 'this person'}`} onClick={() => setN((n + 1) % p.photos.length)}>{imgs}</button>
        : <div className="arch">{imgs}</div>}
      {p.name && <div className="person-name">{p.name}</div>}
      <div className={`person-role${/^(Best Man|Chief)/.test(p.role) ? ' is-best' : ''}`}>{p.role}</div>
      {many && <span className="person-hint">tap for another photo</span>}
    </Reveal>
  );
}

export default function OurPeople() {
  return (
    <>
      <section className="shell page-head">
        <div>
          <Reveal as="p" className="eyebrow">Our people</Reveal>
          <Reveal as="h1">The ones standing with us</Reveal>
          <Reveal as="p" className="lede">Every one of them has carried something for us: a secret, a suitcase, a phone call at an unreasonable hour. On the day, look for them beside us.</Reveal>
        </div>
        <ArchPhoto src={SITE.photos.people} alt="The couple against a red-brick wall" />
      </section>

      <section className="section section--tight">
        <div className="shell">
          <Reveal as="p" className="eyebrow center">Standing with the bride</Reveal>
          <Reveal as="hr" className="rule" style={{ marginBlock: '18px clamp(24px,4vw,44px)' }} />
          {SITE.bridesmaids.length ? (
            <div className="people-grid">{SITE.bridesmaids.map((p, i) => <Person p={p} key={p.name || `b${i}`} />)}</div>
          ) : (
            <Reveal className="pending">
              <Monogram size={70} />
              <p className="eyebrow">Coming soon</p>
              <h3 style={{ marginBlock: '10px 12px' }}>The bridesmaids</h3>
              <p>Our girls are getting their portraits ready. They will be introduced right here as soon as the photographs arrive.</p>
            </Reveal>
          )}
        </div>
      </section>

      <section className="section section--blush">
        <div className="shell">
          <Reveal as="p" className="eyebrow center">Standing with the groom</Reveal>
          <Reveal as="hr" className="rule" style={{ marginBlock: '18px clamp(24px,4vw,44px)' }} />
          <div className="people-grid">
            {SITE.groomsmen.map((p, i) => <Person p={p} key={p.name || `g${i}`} />)}
          </div>
        </div>
      </section>
    </>
  );
}
