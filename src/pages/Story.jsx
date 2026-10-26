import SITE from '../data/site';
import { Monogram, Reveal } from '../components/ui';
import { ArchPhoto, first } from './shared';

export default function Story() {
  const st = SITE.story;
  return (
    <>
      <section className="shell page-head">
        <div>
          <Reveal as="p" className="eyebrow">Our story</Reveal>
          <Reveal as="h1">{st.title || 'How we got here'}</Reveal>
          <Reveal as="p" className="lede">In the groom’s own words: how a video, a secret flight and four journeys across an ocean led to this day.</Reveal>
        </div>
        <ArchPhoto src={SITE.photos.story[0]} alt={`${first(SITE.couple.bride)} and ${first(SITE.couple.groom)}, close`} />
      </section>

      <section className="section section--tight">
        <div className="shell">
          {st.chapters.length ? (
            <div className="chronicle">
              {st.chapters.map((c) => (
                <Reveal key={c.kicker}>
                  <span className="kicker">{c.kicker}</span>
                  {c.body.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                </Reveal>
              ))}
              {st.author && <Reveal as="p" className="story-sign">— {st.author}</Reveal>}
            </div>
          ) : (
            <Reveal className="pending">
              <Monogram size={70} />
              <p className="eyebrow">The full story</p>
              <h3 style={{ marginBlock: '10px 12px' }}>Being written, in our own words</h3>
              <p>How we met, the years between, and the question that changed everything. We are putting it down properly, and it will live right here.</p>
            </Reveal>
          )}
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="center">
            <Reveal as="p" className="eyebrow">Then &amp; now</Reveal>
            <Reveal as="h2" style={{ marginTop: 12 }}>From little ones to this day</Reveal>
          </div>
          <div className="thennow">
            {(st.thenNow.length ? st.thenNow : [{ who: first(SITE.couple.bride) }, { who: first(SITE.couple.groom) }]).map((t, k) => (
              <Reveal className="tn-pair" delay={k * 0.1} key={t.who}>
                <div className="tn-frames">
                  {[['Then', t.baby], ['Now', t.now]].map(([label, src]) => (
                    <figure className="tn-frame" key={label}>
                      {src ? <img src={src} alt={`${t.who}, ${label.toLowerCase()}`} loading="lazy" /> : <div className="tn-empty"><Monogram size={54} /><small>Photo coming soon</small></div>}
                      <figcaption>{label}</figcaption>
                    </figure>
                  ))}
                  <span className="tn-arrow" aria-hidden="true">&rarr;</span>
                </div>
                <p className="tn-who">{t.who}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--blush">
        <div className="shell">
          <div className="center">
            <Reveal as="p" className="eyebrow">Milestones</Reveal>
            <Reveal as="h2" style={{ marginTop: 12 }}>The dates that matter</Reveal>
          </div>
          <div className="timeline">
            {st.milestones.map((m, i) => (
              <Reveal className="tl-item" delay={i * 0.1} key={m.date}>
                <span className="eyebrow">{m.date}</span><h3>{m.title}</h3><p>{m.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {st.pullquote && (
        <section className="section center"><div className="shell"><Reveal as="p" className="pullquote">&ldquo;{st.pullquote}&rdquo;</Reveal></div></section>
      )}

      <section className="section center">
        <div className="shell">
          <Reveal className="ornament"><i /></Reveal>
          <Reveal as="h2" style={{ marginBottom: 6 }}>See the day we planned</Reveal>
          <div className="btn-row">
            <Reveal as="a" className="btn" href="#/wedding-day">The wedding day</Reveal>
            <Reveal as="a" className="btn btn--ghost" href="#/gallery">Gallery</Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
