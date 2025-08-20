import styles from '../LegalStyles.module.css';

export const metadata = {
  title: 'Terms of Service | REDACTED',
};

export default function TermsPage() {
  return (
    <main className={styles.container}>
      <header>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.subtitle}>
          Basic terms for using the REDACTED platform and purchasing digital assets.
        </p>
      </header>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>1. Scope</h2>
        <p className={styles.text}>
          These Terms govern the use of the marketplace, including the purchase of digital models and licenses.
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>2. Accounts & Roles</h2>
        <p className={styles.text}>
          Users may register as buyers or creators. You are responsible for the accuracy and security of your account.
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>3. Pricing, VAT & Currency</h2>
        <p className={styles.text}>
          Prices are displayed in EUR. VAT is calculated based on applicable rules and displayed at checkout; your invoice
          shows net + VAT = gross total. 
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>4. Licenses & Downloads</h2>
        <p className={styles.text}>
          License types (e.g., personal/commercial/enterprise) define usage rights. Downloads may be limited per license.
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>5. Refunds</h2>
        <p className={styles.text}>
          Due to the nature of digital goods, refunds may be limited. Please contact support in case of issues.
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>6. Liability</h2>
        <p className={styles.text}>
          The platform is provided “as is”. We are not liable for damages beyond mandatory statutory provisions.
        </p>
      </section>
      <p className={styles.small}>
        This page is a template and does not constitute legal advice.
      </p>
    </main>
  );
}
