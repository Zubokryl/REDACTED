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
  const [showImages, setShowImages] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowImages(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const weaponImages = [
    '/weapon-previews/Sword-removebg-preview.png',
    '/weapon-previews/Poleaxe-removebg-preview.png',
    '/weapon-previews/knife-removebg-preview.png',
    '/weapon-previews/Hellebarde-removebg-preview.png',
    '/weapon-previews/buchse-removebg-preview.png',
    '/weapon-previews/Armor-removebg-preview.png',
  ];

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
        <HomeClient>{null}</HomeClient>

        {showImages && (
  <div className={styles.weaponImagesContainer}>
    {/* Левая сторона */}
    <div className={`${styles.weaponColumn} ${styles.left}`}>
      {weaponImages.slice(0, 3).map((src, index) => (
        <Image
          key={index}
          src={src}
          alt={`Weapon ${index + 1}`}
          width={100}
          height={100}
          className={styles.weaponImage}
        />
      ))}
    </div>

    {/* Правая сторона */}
    <div className={`${styles.weaponColumn} ${styles.right}`}>
      {weaponImages.slice(3, 6).map((src, index) => (
        <Image
          key={index + 3}
          src={src}
          alt={`Weapon ${index + 4}`}
          width={100}
          height={100}
          className={styles.weaponImage}
        />
      ))}
    </div>
  </div>
)}

        
      </main>
    </>
  );
}
