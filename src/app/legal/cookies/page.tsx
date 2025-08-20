// src/app/legal/cookies/page.tsx
import CookiesContent from './CookiesContent';
import styles from '../LegalStyles.module.css';

export const metadata = {
  title: 'Cookies | REDACTED',
  description: 'Cookie settings and information about cookies on REDACTED.',
};

export default function CookiesPage() {
  return (
    <main className={styles.container}>
      <header className={styles.heroSection}>
        <h1 className={styles.title}>Cookies</h1>
        <p className={styles.subtitle}>
          Learn about the cookies we use and manage your preferences.
        </p>
      </header>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Types of cookies</h2>
        <ul className={styles.list}>
          <li>
            <strong>Necessary:</strong> Required for core functionality (security, login, basic features).
          </li>
          <li>
            <strong>Analytics (optional):</strong> Help us understand usage.
          </li>
          <li>
            <strong>Marketing (optional):</strong> Personalised/functional improvements.
          </li>
        </ul>
      </section>

      {/* Client component with buttons + reset */}
      <CookiesContent />

      <p className={styles.small}>
        For details about personal data processing, see our{' '}
        <a className={styles.link} href="/legal/privacy">Privacy Policy</a>.
      </p>
    </main>
  );
}
