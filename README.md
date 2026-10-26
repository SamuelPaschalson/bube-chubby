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
- **RSVP:** writes to the Google Form (see RSVP-SETUP.md), max 2 seats.
