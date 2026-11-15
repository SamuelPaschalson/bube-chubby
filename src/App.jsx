import { useEffect, useState } from 'react';
import SITE from './data/site';
import { ROUTES, routeFor } from './routes';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Intro from './components/Intro';
import MusicToggle from './components/MusicToggle';
import { RsvpServiceProvider } from './features/rsvp/RsvpServiceProvider';

const first = (s) => s.split(' ')[0];

function wasOpened() {
  try { if (sessionStorage.getItem('bc-opened') === '1') return true; } catch {}
  // Deep links into an inner page skip the opener; ?intro=1 forces it.
  if (/[?&]intro=1/.test(window.location.search)) return false;
  return (window.location.hash || '#/') !== '#/';
}

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash || '#/');
  const [skipIntro] = useState(wasOpened);
  const [revealed, setRevealed] = useState(skipIntro);
  const [introDone, setIntroDone] = useState(skipIntro);

  useEffect(() => {
    const onHash = () => { setHash(window.location.hash || '#/'); window.scrollTo({ top: 0, behavior: 'auto' }); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('revealed', revealed);
    document.body.classList.toggle('is-locked', !introDone);
  }, [revealed, introDone]);

  const route = routeFor(hash);
  const { Component } = route;
  useEffect(() => {
    document.title = route.path === '/'
      ? `${SITE.couple.bride} & ${SITE.couple.groom} · ${SITE.date.short}`
      : `${route.title} · ${first(SITE.couple.bride)} & ${first(SITE.couple.groom)}`;
  }, [route]);

  const done = () => {
    try { sessionStorage.setItem('bc-opened', '1'); } catch {}
    setIntroDone(true);
  };

  return (
    <RsvpServiceProvider>
      <a className="skip-link" href="#main">Skip to content</a>
      <Nav current={route.path} />
      <main id="main" data-page={route.path === '/' ? 'home' : route.path.slice(1)}>
        <Component key={route.path} />
      </main>
      <Footer />
      <MusicToggle visible={revealed} />
      {!introDone && <Intro onReveal={() => setRevealed(true)} onDone={done} />}
    </RsvpServiceProvider>
  );
}
