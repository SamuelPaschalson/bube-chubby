import { useEffect, useState } from 'react';
import SITE from '../data/site';

const target = new Date(SITE.dateISO).getTime();
const calc = () => {
  const d = Math.max(0, target - Date.now());
  return { done: d === 0, days: Math.floor(d / 864e5), hours: Math.floor(d / 36e5) % 24, minutes: Math.floor(d / 6e4) % 60, seconds: Math.floor(d / 1e3) % 60 };
};

export default function Countdown() {
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, []);
  if (t.done) return <p className="script gold-text" style={{ fontSize: 44 }}>Today is the day.</p>;
  return (
    <div className="countdown" role="timer" aria-live="off">
      {['days', 'hours', 'minutes', 'seconds'].map((u) => (
        <div className="count-cell" key={u}>
          <div className="count-num">{String(t[u]).padStart(2, '0')}</div>
          <div className="count-label">{u[0].toUpperCase() + u.slice(1)}</div>
        </div>
      ))}
    </div>
  );
}
