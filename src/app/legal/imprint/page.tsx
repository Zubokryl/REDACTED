import styles from '../LegalStyles.module.css';

export const metadata = {
  title: 'Imprint | REDACTED',
};

export default function ImprintPage() {
  return (
    <main className={styles.container}>
      <header>
        <h1 className={styles.title}>Imprint (Impressum)</h1>
        <p className={styles.subtitle}>
          Legal disclosure according to §5 ECG (Austria) / general EU requirements.
        </p>
      </header>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Site Operator</h2>
        <p className={styles.text}>
          <strong>Company:</strong> REDACTED<br />
          <strong>Address:</strong> Hohenstaufengasse 6, 1010 Wien, Austria<br />
          <strong>Contact:</strong> contact@yourdomain.tld | +43 000 000000<br />
          <strong>Company Register:</strong> FN 123456<br />
          <strong>VAT ID (UID):</strong> ATU12345678
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Responsible for Content</h2>
        <p className={styles.text}>
          REDACTED, Hohenstaufengasse 6, 1010 Wien
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>EU Online Dispute Resolution</h2>
        <p className={styles.text}>
          Consumers have the possibility to submit complaints to the EU’s ODR platform:{' '}
          <a className={styles.link} href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">
            https://ec.europa.eu/consumers/odr
          </a>.
        </p>
      </section>
    <p className={styles.small}>
        This page is a template and does not constitute legal advice.
    </p>
    </main>
  );
}
