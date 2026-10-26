import SITE from '../data/site';
import { Reveal } from '../components/ui';
import { ArchPhoto, Contacts } from './shared';

export default function GuestGuide() {
  return (
    <>
      <section className="shell page-head">
        <div>
          <Reveal as="p" className="eyebrow">Guest guide</Reveal>
          <Reveal as="h1">Everything else you might ask</Reveal>
          <Reveal as="p" className="lede">Timings, dress, travel and who to call. Short on purpose, so you can find what you need and get back to choosing an outfit.</Reveal>
        </div>
        <ArchPhoto src={SITE.photos.guide} alt="The couple on a stone balustrade" />
      </section>
      <section className="section">
        <div className="shell">
          <div className="center" style={{ marginBottom: 34 }}>
            <Reveal as="p" className="eyebrow">Questions</Reveal>
            <Reveal as="h2" style={{ marginTop: 12 }}>Asked &amp; answered</Reveal>
          </div>
          <Reveal className="faq">
            {SITE.faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
          </Reveal>
        </div>
      </section>
      <section className="section section--plum">
        <div className="shell center">
          <Reveal as="p" className="eyebrow">Contact</Reveal>
          <Reveal as="h2" style={{ marginBlock: '12px 14px' }}>Who to call</Reveal>
          <Reveal as="p" className="lede" style={{ color: 'rgba(246,231,223,.78)' }}>Please save these numbers before the day. On the morning itself, phones get very busy.</Reveal>
          <Contacts />
        </div>
      </section>
    </>
  );
}
