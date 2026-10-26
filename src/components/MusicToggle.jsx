import { useEffect, useState } from 'react';
import { Music } from '../lib/audio';

export default function MusicToggle({ visible }) {
  const [, force] = useState(0);
  useEffect(() => { Music.probe(); return Music.subscribe(() => force((n) => n + 1)); }, []);
  const playing = Music.isPlaying();
  if (!visible || Music.isBroken()) return null;
  return (
    <button className="music is-available" data-playing={playing} aria-label={playing ? 'Pause music' : 'Play music'}
      title={playing ? 'Pause music' : 'Play music'} onClick={() => (playing ? Music.pause() : Music.play())}>
      <i /><i /><i />
    </button>
  );
}
