import SITE from '../data/site';
import { ROUTES } from '../routes';
import { Monogram } from './ui';

export default function Footer() {
  return (
    <footer className="footer">
      <Monogram size={84} />
      <p className="footer-names">{SITE.couple.bride} &amp; {SITE.couple.groom}</p>
      <p className="footer-meta">{SITE.date.short} · {SITE.date.city}</p>
      <ul className="footer-links">
        {ROUTES.map((r) => <li key={r.path}><a href={`#${r.path}`}>{r.nav}</a></li>)}
      </ul>
      <p className="footer-hash">{SITE.couple.hashtag}</p>
      <p className="footer-fine">{SITE.couple.nickname} · 02 · 01 · 2027</p>
    </footer>
  );
}
