import { useEffect, useRef, useState } from 'react';

export function useAudioPlayer(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return; // проверка на клиент
    audioRef.current = new Audio(src);

    const audio = audioRef.current;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [src]);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const fadeOut = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume = parseFloat((audio.volume - 0.05).toFixed(2));
        } else {
          clearInterval(fadeOut);
          audio.pause();
          audio.volume = 0.4;
        }
      }, 100);
    } else {
      audio.volume = 0.4;
      audio.play();
    }
  };

  return { audioRef, isPlaying, toggleAudio };
}