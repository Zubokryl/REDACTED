import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <nav className={styles.links} aria-label="Footer Navigation">
        <Link className={styles.link} href="/press">Press</Link>
        <span className={styles.sep}>•</span>
        <Link className={styles.link} href="/legal/imprint">Imprint</Link>
        <span className={styles.sep}>•</span>
        <Link className={styles.link} href="/legal/privacy">Privacy Policy</Link>
        <span className={styles.sep}>•</span>
        <Link className={styles.link} href="/legal/terms">Terms</Link>
        <span className={styles.sep}>•</span>
        <Link className={styles.link} href="/legal/cookies">Cookies</Link>
      </nav>
      <p className={styles.copy}>&copy; {year} REDACTED. All rights reserved.</p>
    </footer>
  );
}
