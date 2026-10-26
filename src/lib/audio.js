import SITE from '../data/site';
/** One shared <audio> for the whole site. Hidden gracefully if song.mp3 is absent. */
let audio = null;
let broken = false;
const listeners = new Set();
const tell = () => listeners.forEach((fn) => fn());

function get() {
  if (audio || broken) return audio;
  audio = new Audio(SITE.song);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0;
  audio.addEventListener('play', tell);
  audio.addEventListener('pause', tell);
  audio.addEventListener('error', () => { broken = true; tell(); });
  return audio;
}
function fadeIn(el, target = 0.4) {
  const id = setInterval(() => {
    el.volume = Math.min(target, el.volume + target / 24);
    if (el.volume >= target) clearInterval(id);
  }, 50);
}
export const Music = {
  async play() {
    const el = get();
    if (!el || broken) return false;
    try { el.volume = 0; await el.play(); fadeIn(el); return true; } catch { return false; }
  },
  pause() { if (audio) audio.pause(); },
  isPlaying: () => !!audio && !audio.paused,
  isBroken: () => broken,
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  probe() { get(); },
};
