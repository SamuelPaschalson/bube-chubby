import { useId } from 'react';

/** Wreath monogram "B C" — drawn in code so it stays sharp at any size. */
export function Monogram({ size = 96, className = '' }) {
  const id = useId().replace(/:/g, '');
  const grad = `url(#${id})`;
  const leaves = [];
  const N = 9;
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const a = side === 0 ? 180 + t * 140 : 180 - t * 140;
      const rad = (a * Math.PI) / 180;
      const x = 50 + 37 * Math.sin(rad);
      const y = 50 - 37 * Math.cos(rad);
      const tilt = side === 0 ? 22 : -22;
      leaves.push(
        <ellipse key={`${side}-${i}`} cx={x.toFixed(2)} cy={y.toFixed(2)} rx="1.7" ry="4.6"
          transform={`rotate(${(a + 90 + tilt).toFixed(1)} ${x.toFixed(2)} ${y.toFixed(2)})`} fill={grad} opacity=".9" />
      );
    }
  }
  return (
    <svg className={`monogram ${className}`} viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="B and C monogram" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d29a" /><stop offset=".5" stopColor="#b98a45" /><stop offset="1" stopColor="#8a5f27" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="47" fill="none" stroke={grad} strokeWidth=".9" />
      <circle cx="50" cy="50" r="44.6" fill="none" stroke={grad} strokeWidth=".4" />
      {leaves}
      <text x="31" y="61" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="40" fontWeight="600" fill={grad}>B</text>
      <text x="47" y="63" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="40" fontWeight="600" fill={grad}>C</text>
    </svg>
  );
}

/** Decorative botanical sprig for the hero corners. */
export function Sprig({ className = '' }) {
  const id = useId().replace(/:/g, '');
  const n = 11;
  const parts = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = 20 + t * 150;
    const y = 150 - Math.sin(t * 2.2) * 80 - t * 20;
    const up = i % 2 === 0;
    const cy = y + (up ? -10 : 10);
    parts.push(
      <ellipse key={`l${i}`} cx={x.toFixed(1)} cy={cy.toFixed(1)} rx={(7 - t * 3.2).toFixed(1)} ry={(17 - t * 6).toFixed(1)}
        transform={`rotate(${((up ? -50 : 40) + t * 24).toFixed(0)} ${x.toFixed(1)} ${cy.toFixed(1)})`} fill={`url(#${id})`} />
    );
    if (i % 3 === 1) parts.push(<circle key={`b${i}`} cx={(x + 8).toFixed(1)} cy={(y + (up ? -26 : 26)).toFixed(1)} r="3.4" fill="#d79a96" />);
  }
  return (
    <svg className={`sprig ${className}`} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e7c28f" /><stop offset="1" stopColor="#c98f8a" /></linearGradient>
      </defs>
      <path d="M12 156 C70 70 120 100 182 38" fill="none" stroke="#c9a063" strokeWidth="1.4" opacity=".8" />
      {parts}
    </svg>
  );
}

/** Responsive <img>: every photo ships as NAME.jpg (full) + NAME-800.jpg. */
export function Photo({ src, alt = '', eager = false, sizes = '(max-width: 700px) 92vw, 540px' }) {
  const isFull = /\.jpe?g$/i.test(src);
  const full = isFull ? src : `${src}.jpg`;
  const small = isFull ? null : `${src}-800.jpg`;
  return (
    <img
      src={small || full}
      srcSet={small ? `${small} 800w, ${full} 1196w` : undefined}
      sizes={small ? sizes : undefined}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}

export const icons = {
  church: (
    <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 3v8M20.5 6.5h7M24 11 11 21v22h26V21Z M20 43V31a4 4 0 0 1 8 0v12 M5 43h38" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  glasses: (
    <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M13 6h10l-1.4 14a3.6 3.6 0 0 1-7.2 0Z M18 24v16 M13 41h10 M27 9l9.5 3.2-4.2 13.4a3.6 3.6 0 0 1-6.9-2.2Z M31 28l-3.4 11.5 M25 40.8l8.6 2.6 M16 11h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l1.6 4.4-2.3 1.5a11 11 0 0 0 5.8 5.8l1.5-2.3L20 15v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
  ),
};

/** Scroll-reveal wrapper. */
import { useEffect, useRef, useState } from 'react';
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal${seen ? ' is-visible' : ''} ${className}`.trim()} style={{ '--d': `${delay}s`, ...(rest.style || {}) }} {...{ ...rest, style: undefined }}>
      {children}
    </Tag>
  );
}
