import { useEffect, useRef, useState } from 'react';
import SITE from '../data/site';
import { Music } from '../lib/audio';

/**
 * THE OPENING
 *   closed → opening → peek → out → leaving → untie → curtains
 * Tap the seal: flap opens, invitation slides out, envelope drifts away, the
 * ribbon bow holding the drapes is untied, then the ivory & champagne drapes
 * part from the centre and the website is revealed behind them.
 */
const T = { flap: 900, peek: 900, out: 1700, hold: 2500, leave: 800, untie: 1300, curtains: 3500 }; // ms
const FOLDS = 15;

// Fold depth varies a little from fold to fold so the cloth never looks tiled.
const amp = (j) => (0.42 + 0.3 * Math.abs(Math.sin(j * 2.31 + 0.6))).toFixed(2);

function Drape({ side }) {
  return (
    <div className={`drape drape--${side}`} aria-hidden="true">
      <div className="folds">
        {Array.from({ length: FOLDS }, (_, j) => (
          // j = 0 is the outer edge, FOLDS-1 the leading edge at the centre.
          // The leading edge moves first; the rest follow in a ripple.
          <i key={j} className="fold" style={{ '--j': j, '--a': amp(j + (side === 'r' ? 5 : 0)), '--delay': `${((FOLDS - 1 - j) * 0.07).toFixed(2)}s` }} />
        ))}
      </div>
    </div>
  );
}


function Tie() {
  return (
    <div className="tie" aria-hidden="true">
      <svg viewBox="0 0 200 120" focusable="false">
        <defs>
          <linearGradient id="rb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3dfae" /><stop offset=".5" stopColor="#d9b46c" /><stop offset="1" stopColor="#b98a45" /></linearGradient>
          <linearGradient id="rb2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e6bf" /><stop offset="1" stopColor="#c89a52" /></linearGradient>
        </defs>
        <rect className="band" x="-30" y="50" width="260" height="18" fill="url(#rb)" stroke="#a87a38" strokeWidth=".6" />
        <path className="tail tail-l" d="M97 64 L66 116 L84 108 L92 118 L104 66Z" fill="url(#rb2)" stroke="#a87a38" strokeWidth=".6" />
        <path className="tail tail-r" d="M103 64 L134 116 L116 108 L108 118 L96 66Z" fill="url(#rb2)" stroke="#a87a38" strokeWidth=".6" />
        <path className="loop loop-l" d="M100 59 C70 4 6 14 14 58 C20 98 70 88 100 59Z M100 59 C76 32 40 30 36 54 C34 72 70 76 100 59Z" fillRule="evenodd" fill="url(#rb2)" stroke="#a87a38" strokeWidth=".6" />
        <path className="loop loop-r" d="M100 59 C130 4 194 14 186 58 C180 98 130 88 100 59Z M100 59 C124 32 160 30 164 54 C166 72 130 76 100 59Z" fillRule="evenodd" fill="url(#rb2)" stroke="#a87a38" strokeWidth=".6" />
        <ellipse className="knot" cx="100" cy="59" rx="11" ry="13" fill="url(#rb)" stroke="#a87a38" strokeWidth=".7" />
      </svg>
    </div>
  );
}

export default function Intro({ onReveal, onDone }) {
  const [stage, setStage] = useState('closed');
  const [gone, setGone] = useState(false);
  const timers = useRef([]);
  const started = useRef(false);
  const revealed = useRef(false);
  const reduced = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const after = (ms, fn) => timers.current.push(setTimeout(fn, ms));
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const reveal = () => { if (!revealed.current) { revealed.current = true; onReveal(); } };
  const finish = () => { clear(); reveal(); setGone(true); setTimeout(onDone, 500); };

  const open = () => {
    if (started.current) return;
    started.current = true;
    Music.play(); // inside the tap, so browsers allow it
    if (reduced.current) {
      setStage('leaving'); after(400, () => setStage('untie')); after(700, () => setStage('curtains')); after(900, finish); return;
    }
    setStage('opening');
    let t = T.flap;
    after(t, () => setStage('peek'));
    t += T.peek; after(t, () => setStage('out'));
    t += T.out + T.hold; after(t, () => setStage('leaving'));
    t += T.leave; after(t, () => setStage('untie'));
    t += T.untie; after(t, () => { setStage('curtains'); reveal(); });
    t += T.curtains; after(t, finish);
  };

  const skip = () => {
    if (!started.current) { started.current = true; Music.play(); }
    clear();
    setStage('curtains');
    reveal();
    after(reduced.current ? 300 : T.curtains - 200, finish);
  };

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && skip();
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); clear(); };
  }, []);

  const S = SITE;
  return (
    <div className={`intro${gone ? ' is-gone' : ''}`} data-stage={stage} role="dialog" aria-label="Wedding invitation">
      <Drape side="l" />
      <Drape side="r" />
      <Tie />
      <div className="intro-spot" />
      <div className="rod" />
      <div className="valance" />

      <div className="intro-ui">
        <div className="intro-head">
          <p className="intro-pre">You are invited to the wedding of</p>
          <p className="intro-names">Bube <i>&amp;</i> Chubby</p>
          <p className="intro-date">{S.date.numeric}</p>
        </div>

        <div className="env-wrap">
          <div className="env-shadow" />
          <button type="button" className="envelope" onClick={open} aria-label={`Open the invitation from ${S.couple.bride} and ${S.couple.groom}`}>
            <span className="env-back" />
            <span className="env-letter">
              <span className="lt-pre">Together with their families</span>
              <span className="lt-names">{S.couple.bride}</span>
              <span className="lt-amp">&amp;</span>
              <span className="lt-names">{S.couple.groom}</span>
              <span className="lt-rule" />
              <span className="lt-date">{S.date.weekday} · {S.date.short}</span>
              <span className="lt-place">{S.events[0].venue}<br />{S.date.city}</span>
            </span>
            <svg className="env-front" viewBox="0 0 100 66.67" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="ef-side" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e9cfae" /><stop offset="1" stopColor="#d5b184" /></linearGradient>
                <linearGradient id="ef-bot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6e6cf" /><stop offset="1" stopColor="#e2c298" /></linearGradient>
              </defs>
              <path d="M0,0 L50,38 L0,66.67 Z" fill="url(#ef-side)" stroke="rgba(140,96,60,.38)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <path d="M100,0 L50,38 L100,66.67 Z" fill="url(#ef-side)" stroke="rgba(140,96,60,.38)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <path d="M0,66.67 L50,33 L100,66.67 Z" fill="url(#ef-bot)" stroke="rgba(140,96,60,.38)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>
            <span className="env-flap">
              {[['face-out', '#f3e0c3', '#dcbd92'], ['face-in', '#dca7a1', '#b57b7c']].map(([cls, a, b]) => (
                <svg key={cls} className={`face ${cls}`} viewBox="0 0 100 38" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                  <defs><linearGradient id={`${cls}-g`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
                  <polygon points="0,0 100,0 50,38" fill={`url(#${cls}-g)`} stroke="rgba(140,96,60,.42)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                </svg>
              ))}
            </span>
            <span className="env-seal" aria-hidden="true">
              <span className="seal-ring" />
              <span className="seal-mono">P<i>&amp;</i>C</span>
            </span>
          </button>
        </div>

        <div className="intro-foot">
          <p className="intro-hint">Tap the seal to open</p>
          <button type="button" className="intro-skip" onClick={skip}>Skip</button>
        </div>
      </div>
    </div>
  );
}
