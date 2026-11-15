# Chimdiebube Precious & Chukwuebuka Edward — 2nd January 2027

React + Vite wedding site.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # -> dist/ (upload to Vercel / Netlify / cPanel)
```

`dist/` already contains a ready-to-upload build (made with esbuild while the project
was authored; `npm run build` produces the Vite equivalent).

- **All content:** `src/data/site.js` (search `TODO:` — names for the four new groomsmen,
  bridesmaids, story text, hashtag, RSVP deadline, `public/song.mp3`).
- **Opening (envelope + drape curtains):** `src/components/Intro.jsx`, `src/styles/intro.css`
  (`FOLDS` = number of folds, `--g` = how tightly the open curtains bunch). `?intro=1` replays it.
- **RSVP:** each reply goes straight into the couple's Google Form (follow it in the form's Sheet). Guests may
  bring up to two guests: plus one / plus two (`rsvp.maxPlusOnes`). Attending guests see their access card at once and can download it;
  the access code and plus one / two are in the Sheet's note column for checking at the entrance. Setup: RSVP-SETUP.md.
