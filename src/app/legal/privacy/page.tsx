import styles from '../LegalStyles.module.css';

export const metadata = {
  title: 'Privacy Policy | REDACTED',
};

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.container}>
      <header>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.subtitle}>
          Information on data processing pursuant to GDPR (EU) and Austrian law.
        </p>
      </header>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Controller</h2>
        <p className={styles.text}>
          YOUR COMPANY NAME, Street 1, 1234 City, Austria, contact@yourdomain.tld
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>What we process</h2>
        <ul className={styles.list}>
          <li>Account data (name, email, role).</li>
          <li>Content you upload (models, images, descriptions).</li>
          <li>Transaction data (orders, prices, VAT amounts).</li>
          <li>Technical data (IP address, logs, cookies/consent state).</li>
        </ul>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Legal Bases (Art. 6 GDPR)</h2>
        <ul className={styles.list}>
          <li>Contract performance (account, orders, downloads).</li>
          <li>Legal obligation (tax/VAT records per AO/UStG).</li>
          <li>Legitimate interests (abuse prevention, security).</li>
          <li>Consent (cookies requiring consent, newsletter if any).</li>
        </ul>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Payments</h2>
        <p className={styles.text}>
          We use Stripe to process payments. Stripe may receive data necessary to process
          transactions (amount, currency, card details via Stripe Elements, etc.). See Stripe’s
          privacy policy:{' '}
          <a className={styles.link} href="https://stripe.com/privacy" target="_blank" rel="noreferrer">
            https://stripe.com/privacy
          </a>.
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Cookies & Consent</h2>
        <p className={styles.text}>
          We use necessary cookies (session/auth). Non-essential cookies are only set with your
          consent. Manage your preferences on the{' '}
          <a className={styles.link} href="/legal/cookies">Cookies page</a>.
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Your Rights</h2>
        <ul className={styles.list}>
          <li>Access, rectification, erasure, restriction, portability, objection.</li>
          <li>Withdraw consent at any time (for future processing).</li>
          <li>Complain to the Austrian DPA: <a className={styles.link} href="https://www.dsb.gv.at/" target="_blank" rel="noreferrer">https://www.dsb.gv.at/</a></li>
        </ul>
      </section>

      <p className={styles.small}>
        This page is a template and does not constitute legal advice.
      </p>
    </main>
  );
}
