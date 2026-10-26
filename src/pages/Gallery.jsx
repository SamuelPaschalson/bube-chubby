import { useCallback, useEffect, useRef, useState } from 'react';
import SITE from '../data/site';
import { Photo, Reveal } from '../components/ui';

export default function Gallery() {
  const [idx, setIdx] = useState(null);
  const touch = useRef(null);
  const n = SITE.gallery.length;
  const close = useCallback(() => setIdx(null), []);
  const step = useCallback((d) => setIdx((i) => (i === null ? i : (i + d + n) % n)), [n]);

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [idx === null, close, step]);

  const cur = idx === null ? null : SITE.gallery[idx];
  return (
    <>
      <section className="shell page-head page-head--plain">
        <div>
          <Reveal as="p" className="eyebrow">Gallery</Reveal>
          <Reveal as="h1">Us, so far</Reveal>
          <Reveal as="p" className="lede">Fresh from our engagement session with F10 Studio. Tap any photo to see it larger. After the wedding, add yours with {SITE.couple.hashtag}.</Reveal>
        </div>
      </section>
      <section className="section section--tight" style={{ paddingTop: 0 }}>
        <div className="shell"><div className="mosaic">
          {SITE.gallery.map((p, i) => (
            <Reveal as="button" type="button" key={p.src} aria-label={`Open photo ${i + 1}: ${p.alt}`} onClick={() => setIdx(i)}>
              <Photo src={p.src} alt={p.alt} sizes="(max-width: 820px) 46vw, 370px" />
            </Reveal>
          ))}
        </div></div>
      </section>

      {cur && (
        <div className="lightbox is-open" role="dialog" aria-modal="true" aria-label="Photo viewer"
          onClick={(e) => e.target === e.currentTarget && close()}
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); }}>
          <button className="lb-btn lb-close" aria-label="Close" onClick={close} autoFocus>&times;</button>
          <button className="lb-btn lb-prev" aria-label="Previous photo" onClick={() => step(-1)}>&#8249;</button>
          <figure><img src={`${cur.src}.jpg`} alt={cur.alt} /><figcaption>{cur.alt}</figcaption></figure>
          <button className="lb-btn lb-next" aria-label="Next photo" onClick={() => step(1)}>&#8250;</button>
        </div>
      )}
    </>
  );
}
