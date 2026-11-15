import SITE from '../data/site';
import { Monogram } from './ui';

/**
 * The guest's access card: shown on the RSVP page straight after they reply,
 * and on the Pass page for cards issued from the Guest List page.
 * `pass` = { fullName, guestOf?, code, plusOnes?: 0 | 1 | 2 }
 */
const PLUS = ['', 'Plus one', 'Plus two'];
const plusOf = (pass) => pass.plusOnes ?? pass.guests?.length ?? 0;
const admits = (n) => (n ? `Admits ${n + 1} guests` : 'Admits one guest');

/* ---------- the card, as the guest sees it ---------- */
export function AccessCard({ pass }) {
  const [ceremony, reception] = SITE.events;
  const n = plusOf(pass);
  return (
    <article className="pass-card" aria-label={`Access card for ${pass.fullName}`}>
      <div className="pass-card__frame">
        <Monogram size={78} />
        <p className="pass-card__kind">Access Card</p>
        <p className="pass-card__names">{SITE.couple.brideShort} &amp; {SITE.couple.groomShort}</p>
        <p className="pass-card__date">{SITE.date.long}</p>
        <hr className="rule" />
        <p className="pass-card__admit">Admit</p>
        <p className="pass-card__guest">{pass.fullName}</p>
        {n > 0 && <p className="pass-card__plus">{PLUS[n] ?? `Plus ${n}`}</p>}
        {pass.guestOf && <p className="pass-card__of">{pass.guestOf}</p>}
        <p className="pass-card__one">{admits(n)}</p>
        <div className="pass-card__code"><small>Access code</small><b>{pass.code}</b></div>
        <dl className="pass-card__events">
          <div><dt>{ceremony.title}</dt><dd>{ceremony.time}<br />{ceremony.venue}</dd></div>
          <div><dt>{reception.title}</dt><dd>{reception.time}<br />{reception.venue}</dd></div>
        </dl>
        <p className="pass-card__fine">Please keep this card on your phone and show it at the entrance, with a valid ID. It admits only the number of guests shown and cannot be transferred.</p>
      </div>
    </article>
  );
}

/* ---------- save the card as a picture (drawn on a canvas so it works offline) ---------- */
export async function downloadCardImage(pass) {
  const n = plusOf(pass);
  const o = n ? 64 : 0; // room for the "Plus one / two" line
  const W = 1080, H = 1620 + o;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  try {
    await Promise.all([
      document.fonts.load("600 64px 'Cormorant Garamond'"),
      document.fonts.load("400 90px 'Pinyon Script'"),
      document.fonts.load("500 30px 'Jost'"),
    ]);
  } catch { /* fall back to the system serif */ }

  const SERIF = "'Cormorant Garamond', Georgia, serif";
  const SCRIPT = "'Pinyon Script', 'Snell Roundhand', cursive";
  const SANS = "'Jost', 'Helvetica Neue', Arial, sans-serif";
  const gold = '#b98a45', wine = '#6e2c45', mauve = '#8e5a63', ink = '#3b2530';

  // paper
  const bg = c.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#fcf7f1'); bg.addColorStop(1, '#f8e9e4');
  c.fillStyle = bg; c.fillRect(0, 0, W, H);
  c.strokeStyle = gold; c.lineWidth = 3; c.strokeRect(34, 34, W - 68, H - 68);
  c.lineWidth = 1; c.strokeRect(50, 50, W - 100, H - 100);

  c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const spaced = (text, y, spacing) => {
    // manual letter-spacing: ctx.letterSpacing is not in every browser
    const chars = [...text];
    const widths = chars.map((ch) => c.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
    let x = W / 2 - total / 2;
    c.textAlign = 'left';
    chars.forEach((ch, i) => { c.fillText(ch, x, y); x += widths[i] + spacing; });
    c.textAlign = 'center';
  };
  const fit = (text, maxWidth, size, weight, family) => {
    let s = size;
    c.font = `${weight} ${s}px ${family}`;
    while (c.measureText(text).width > maxWidth && s > 28) { s -= 2; c.font = `${weight} ${s}px ${family}`; }
    return s;
  };

  // monogram ring
  c.strokeStyle = gold; c.lineWidth = 3;
  c.beginPath(); c.arc(W / 2, 205, 74, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 1.2; c.beginPath(); c.arc(W / 2, 205, 66, 0, Math.PI * 2); c.stroke();
  c.fillStyle = gold; c.font = `600 66px ${SERIF}`;
  c.fillText('B  C', W / 2, 228);

  c.fillStyle = mauve; c.font = `500 24px ${SANS}`;
  spaced('ACCESS CARD', 336, 9);

  c.fillStyle = wine;
  fit(`${SITE.couple.brideShort} & ${SITE.couple.groomShort}`, W - 200, 112, 400, SCRIPT);
  c.fillText(`${SITE.couple.brideShort} & ${SITE.couple.groomShort}`, W / 2, 462);

  c.fillStyle = ink; c.font = `500 36px ${SERIF}`;
  c.fillText(SITE.date.long, W / 2, 530);

  c.strokeStyle = gold; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(W / 2 - 110, 584); c.lineTo(W / 2 + 110, 584); c.stroke();

  c.fillStyle = mauve; c.font = `500 24px ${SANS}`;
  spaced('ADMIT', 662, 10);

  c.fillStyle = wine;
  fit(pass.fullName, W - 220, 92, 600, SERIF);
  c.fillText(pass.fullName, W / 2, 770);

  if (n) {
    c.fillStyle = wine; c.font = `600 58px ${SERIF}`;
    c.fillText(PLUS[n] ?? `Plus ${n}`, W / 2, 834);
  }

  if (pass.guestOf) { c.fillStyle = mauve; c.font = `italic 400 34px ${SERIF}`; c.fillText(pass.guestOf, W / 2, 826 + o); }
  c.fillStyle = mauve; c.font = `500 22px ${SANS}`;
  spaced(admits(n).toUpperCase(), 884 + o, 7);

  // code box
  const bx = 190, by = 940 + o, bw = W - 380, bh = 170;
  c.fillStyle = '#fffdfb'; c.fillRect(bx, by, bw, bh);
  c.strokeStyle = gold; c.lineWidth = 2; c.strokeRect(bx, by, bw, bh);
  c.fillStyle = mauve; c.font = `500 21px ${SANS}`;
  spaced('ACCESS CODE', by + 54, 7);
  c.fillStyle = wine; c.font = `500 66px ${SANS}`;
  spaced(pass.code, by + 128, 9);

  // events
  const [ceremony, reception] = SITE.events;
  [[ceremony, 1190 + o], [reception, 1300 + o]].forEach(([e, y]) => {
    c.fillStyle = mauve; c.font = `500 21px ${SANS}`;
    spaced(e.title.toUpperCase(), y, 6);
    c.fillStyle = ink; c.font = `500 32px ${SERIF}`;
    c.fillText(`${e.time}  ·  ${e.venue}`, W / 2, y + 44);
  });

  c.fillStyle = ink; c.globalAlpha = 0.7; c.font = `400 25px ${SANS}`;
  ['Keep this card on your phone and show it at the entrance, with a valid ID.', 'It admits only the number of guests shown and cannot be transferred.']
    .forEach((line, i) => c.fillText(line, W / 2, 1450 + o + i * 40));
  c.globalAlpha = 1;

  const blob = await new Promise((resolve) => cv.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Could not make the image.');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `access-card-${pass.fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
