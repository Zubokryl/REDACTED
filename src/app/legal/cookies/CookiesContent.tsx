// src/app/legal/cookies/CookiesContent.tsx
'use client';

import { useEffect, useState } from 'react';
import styles from '../LegalStyles.module.css';

type Consent = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = 'cookie-consent-v1';

export default function CookiesContent() {
  const [loaded, setLoaded] = useState(false);
  const [consent, setConsent] = useState<Consent>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Consent;
        setConsent({
          necessary: true,
          analytics: !!parsed.analytics,
          marketing: !!parsed.marketing,
        });
      }
    } catch {}
    setLoaded(true);
  }, []);

  const save = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        necessary: true,
        analytics: consent.analytics,
        marketing: consent.marketing,
      })
    );
    alert('Cookie settings saved.');
  };

  const allowAll = () => {
    const all: Consent = { necessary: true, analytics: true, marketing: true };
    setConsent(all);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    alert('All optional cookies accepted.');
  };

  const resetConsent = () => {
    localStorage.removeItem(STORAGE_KEY);
    // Tell the banner (and other tabs) to re-check:
    window.dispatchEvent(new Event('cookie:reset'));
    alert('Consent reset. The banner will show again.');
  };

  return (
    <section className={styles.card}>
      <h2 className={styles.sectionTitle}>Your choices</h2>

      {!loaded ? (
        <p className={styles.text}>Loading current preferences…</p>
      ) : (
        <>
          <p className={styles.text}>
            Necessary cookies are required to operate the site and cannot be disabled.
          </p>

          <div className={styles.formCard}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <input type="checkbox" checked disabled /> Necessary
              </label>
              <p className={styles.small}>
                Required for security, login and basic functionality.
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <input
                  type="checkbox"
                  checked={consent.analytics}
                  onChange={(e) =>
                    setConsent((c) => ({ ...c, analytics: e.target.checked }))
                  }
                />{' '}
                Analytics
              </label>
              <p className={styles.small}>
                Helps us understand how the site is used.
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <input
                  type="checkbox"
                  checked={consent.marketing}
                  onChange={(e) =>
                    setConsent((c) => ({ ...c, marketing: e.target.checked }))
                  }
                />{' '}
                Marketing
              </label>
              <p className={styles.small}>
                Optional, personalised content/ads.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button className={styles.submitButton} onClick={save}>
                Save
              </button>
              <button className={styles.secondaryButton} onClick={allowAll}>
                Accept all
              </button>
              <button className={styles.secondaryButton} onClick={resetConsent}>
                Reset consent
              </button>
            </div>

            <p className={`${styles.small} ${styles.lastUpdated}`}>
              Last updated: 11 August 2025
            </p>
          </div>
        </>
      )}
    </section>
  );
}
