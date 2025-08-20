import styles from '../LegalStyles.module.css';

export const metadata = {
  title: 'Cookies | REDACTED',
};

export default function CookiesPage() {
  return (
    <main className={styles.container}>
      <header>
        <h1 className={styles.title}>Cookies</h1>
        <p className={styles.subtitle}>
          Learn about the cookies we use and manage your preferences.
        </p>
      </header>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Types of Cookies</h2>
        <ul className={styles.list}>
          <li><strong>Necessary:</strong> Required for core functionality (e.g., auth/session).</li>
          <li><strong>Analytics (optional):</strong> Help us understand usage (set only with consent).</li>
          <li><strong>Functional/Marketing (optional):</strong> Enhance experience (set only with consent).</li>
        </ul>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Your Choices</h2>
        <p className={styles.text}>
          You can accept or decline optional cookies. If you previously consented, you can reset your choice here:
        </p>
        <br />
        <button
          onClick={() => {
            try {
              localStorage.removeItem('cookieConsent');
              document.cookie = 'cookieConsent=; Max-Age=0; path=/';
              alert('Cookie preferences reset. Please reload to see the banner again.');
            } catch {
              alert('Could not reset preferences. Try reloading the page.');
            }
          }}
          style={{
            background: '#A68A56',
            color: '#111',
            border: 'none',
            padding: '0.75rem 1.25rem',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          Reset Cookie Preferences
        </button>
      </section>

      <p className={styles.small}>
        Details on personal data processing can be found in our{' '}
        <a className={styles.link} href="/legal/privacy">Privacy Policy</a>.
      </p>
    </main>
  );
}
