import SITE from '../data/site';
import Countdown from '../components/Countdown';
import { Photo, Reveal, Sprig } from '../components/ui';
import { EventCard, Swatches, first } from './shared';

export default function Home() {
  const [e1, e2] = SITE.events;
  const strip = [SITE.gallery[1], SITE.gallery[2], SITE.gallery[7], SITE.gallery[4]];
  const i = (n) => ({ '--i': n });
  return (
    <>
      <section className="hero" aria-label="Welcome">
        <Sprig className="sprig--tl" /><Sprig className="sprig--br" />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="hero-pre" style={i(0)}>The Agbazue &amp; Ezepue families</p>
            <p className="hero-invite" style={i(1)}>cordially invite you to the wedding ceremony of their children</p>
            <h1 className="hero-names" style={i(2)}>
              <span className="n script gold-text">{SITE.couple.bride}</span>
              <span className="amp">&amp;</span>
              <span className="n script gold-text">{SITE.couple.groom}</span>
            </h1>
            <p className="hero-meta" style={i(3)}><span><b>{SITE.date.weekday}</b> · {SITE.date.short}</span><span>{SITE.date.time}</span></p>
            <p className="hero-meta" style={i(4)}><span>{e1.venue} · {SITE.date.city}</span></p>
            <div className="btn-row" style={i(5)}>
              <a className="btn" href="#/rsvp">RSVP</a>
              <a className="btn btn--ghost" href="#/wedding-day">The wedding day</a>
            </div>
          </div>
          <div className="hero-photo">
            <div className="arch"><Photo src={SITE.photos.hero} alt={`${first(SITE.couple.bride)} and ${first(SITE.couple.groom)}`} eager sizes="(max-width: 820px) 78vw, 460px" /></div>
          </div>
        </div>
      </section>

      <section className="section section--plum" id="countdown">
        <div className="shell center">
          <Reveal as="p" className="eyebrow">Counting down to {SITE.date.numeric}</Reveal>
          <div style={{ height: 28 }} />
          <Reveal><Countdown /></Reveal>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="center" style={{ marginBottom: 'clamp(30px,5vw,56px)' }}>
            <Reveal as="p" className="eyebrow">You are invited</Reveal>
            <Reveal as="h2" style={{ marginTop: 12 }}>Two moments, one Saturday</Reveal>
            <Reveal className="ornament"><i /></Reveal>
            <Reveal as="p" className="lede">The ceremony is at 12 noon prompt and the reception begins at 3:00 pm. This is an adults-only celebration, with no children's party.</Reveal>
          </div>
          <div className="grid-2"><EventCard e={e1} /><EventCard e={e2} /></div>
        </div>
      </section>

      <section className="section section--blush">
        <div className="shell center">
          <Reveal as="p" className="eyebrow">With the blessings of our families</Reveal>
          <div className="families">
            <Reveal className="family"><h3>{SITE.families[0].names}</h3><p>{SITE.families[0].from}</p></Reveal>
            <Reveal className="amp" aria-hidden="true">&amp;</Reveal>
            <Reveal className="family"><h3>{SITE.families[1].names}</h3><p>{SITE.families[1].from}</p></Reveal>
          </div>
        </div>
      </section>

      <section className="section" id="colours">
        <div className="shell center">
          <Reveal as="p" className="eyebrow">Colours of the day</Reveal>
          <Reveal as="h2" style={{ marginTop: 12 }}>Champagne, rose gold &amp; vintage mauve</Reveal>
          <Reveal className="ornament"><i /></Reveal>
          <Reveal as="p" className="lede">We would love to see you dressed in our colours. Wear them well and you will fold right into the room.</Reveal>
          <Swatches />
        </div>
      </section>

      <section className="section section--tight" style={{ paddingBottom: 'clamp(60px,9vw,120px)' }}>
        <div className="shell">
          <div className="center" style={{ marginBottom: 'clamp(28px,4vw,48px)' }}>
            <Reveal as="p" className="eyebrow">Us, so far</Reveal>
            <Reveal as="h2" style={{ marginTop: 12 }}>From the engagement session</Reveal>
          </div>
          <div className="strip">
            {strip.map((p, n) => (
              <Reveal as="a" href="#/gallery" delay={n * 0.1} key={p.src}>
                <div className="arch"><Photo src={p.src} alt={p.alt} sizes="(max-width: 820px) 46vw, 270px" /></div>
              </Reveal>
            ))}
          </div>
          <div className="btn-row" style={{ justifyContent: 'center', marginTop: 'clamp(50px,6vw,70px)' }}>
            <Reveal as="a" className="btn btn--ghost" href="#/gallery">See the gallery</Reveal>
          </div>
        </div>
      </section>

      <section className="section section--plum">
        <div className="shell center">
          <Reveal as="p" className="eyebrow">One more thing</Reveal>
          <Reveal as="h2" style={{ marginBlock: '12px 16px' }}>Kindly let us know you are coming</Reveal>
          <Reveal as="p" className="lede" style={{ color: 'rgba(246,231,223,.78)' }}>A quick reply helps both families plan your seat, your table and your plate.</Reveal>
          <div className="btn-row"><Reveal as="a" className="btn btn--light" href="#/rsvp">RSVP now</Reveal></div>
        </div>
      </section>
    </>
  );
}
