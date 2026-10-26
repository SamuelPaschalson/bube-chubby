import { useEffect, useState } from 'react';
import SITE from '../data/site';
import { ROUTES } from '../routes';
import { Monogram } from './ui';

export default function Nav({ current }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [current]);
  return (
    <header className="nav">
      <nav className="nav-inner shell" aria-label="Main">
        <a className="nav-mark" href="#/" aria-label="Home"><Monogram size={40} /><span>{SITE.date.numeric}</span></a>
        <button className="nav-toggle" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen((v) => !v)}>
          <span className="sr-only">Menu</span><i /><i /><i /><i />
        </button>
        <ul className={`nav-links${open ? ' is-open' : ''}`} id="nav-links">
          {ROUTES.map((r) => (
            <li key={r.path}><a href={`#${r.path}`} className={r.cta ? 'nav-cta' : ''} aria-current={r.path === current ? 'page' : undefined}>{r.nav}</a></li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
