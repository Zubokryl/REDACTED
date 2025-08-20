// src/components/CookieBanner/CookieBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import styles from './CookieBanner.module.css';

const STORAGE_KEY = 'cookie-consent-v1';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const decide = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const url = new URL(window.location.href);
        const force = url.searchParams.get('showBanner') === '1';
        setVisible(force || !raw);
      } catch {
        setVisible(true);
      }
    };

    decide();

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) decide();
    };
    window.addEventListener('storage', onStorage);

    const onReset = () => decide();
    window.addEventListener('cookie:reset', onReset);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cookie:reset', onReset);
    };
  }, []);

  const acceptAll = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ necessary: true, analytics: true, marketing: true })
    );
    setVisible(false);
  };

  const onlyNecessary = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ necessary: true, analytics: false, marketing: false })
    );
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.text}>
        We use cookies to run and improve our site.{' '}
        <a href="/legal/cookies" className={styles.link}>Learn more</a>
      </div>
      <div className={styles.actions}>
        <button className={styles.secondaryButton} onClick={onlyNecessary}>
          Only necessary
        </button>
        <button className={styles.primaryButton} onClick={acceptAll}>
          Accept all
        </button>
      </div>
    </div>
  );
}
