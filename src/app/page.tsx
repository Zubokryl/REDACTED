'use client';

import { useEffect, useState } from 'react';
import localFont from 'next/font/local';
import HomeClient from './HomeClient';
import Image from 'next/image';
import styles from './Page.module.css';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useRandomWidths } from '../hooks/useRandomWidths';

const drexia = localFont({
  src: [
    { path: '../../public/fonts/Drexia.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Drexia.otf', weight: '400', style: 'normal' },
  ],
  display: 'swap',
});

export default function Home() {
  const { isPlaying, toggleAudio } = useAudioPlayer('/background_music.mp3');
  const barWidths = useRandomWidths(3);
  const [showSword, setShowSword] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSword(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <button
        onClick={toggleAudio}
        className={styles.audioButton}
        aria-label="Toggle audio"
        role="switch"
        aria-checked={isPlaying}
      >
        {isPlaying ? (
          <div className={styles.bars}>
            {barWidths.map((width, index) => (
              <div key={index} className={styles.bar} style={{ width }} />
            ))}
          </div>
        ) : (
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>✖</span>
        )}
      </button>

      <main className={`${drexia.className} ${styles.main}`}>
        {showSword && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert('this page does not exist yet');
            }}
            className={styles.swordLink}
          >
            <Image
              src="/vintage_sword.png"
              alt="Sword"
              width={80}
              height={160}
              className={styles.swordImage}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </a>
        )}

        <HomeClient>{null}</HomeClient>
      </main>
    </>
  );
}