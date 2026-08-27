import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import styles from './Footer.module.css';

/**
 * App-wide footer / bottom bar. Shared across pages. Self-contained config.
 *
 * `to` is set for the links that lead somewhere real; the rest stay inert
 * rather than routing to a page that does not exist yet.
 */
const COMPANY_LINKS: Array<{ label: string; to?: string }> = [
  { label: 'Contact Us', to: '/contact' },
  { label: 'Privacy Policy' },
  { label: 'Refund Policy' },
  { label: 'Terms & Conditions' },
  { label: 'Blog' },
];
const CONTACT_EMAIL = 'support@evently.com';
const COPYRIGHT = '© 2026 Evently Technologies Pvt. Ltd. · Made in Hyderabad, India';
const LEGAL = ['Privacy', 'Terms', 'Sitemap'];
const DESCRIPTION =
  'Evently connects Indian families with verified, trained event organizers — from itemised quotes and live tracking to a flawless celebration, all handled in one trusted place.';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <a href="#top" className={styles.logo}>
            <span className={styles.logoAccent}>e</span>
            <span>vently</span>
          </a>
          <p className={styles.desc}>{DESCRIPTION}</p>
        </div>

        <nav className={styles.linksCol} aria-label="Company">
          <h2 className={styles.colTitle}>Company</h2>
          <ul className={styles.linkList}>
            {COMPANY_LINKS.map((l) => (
              <li key={l.label}>
                {l.to ? (
                  <Link to={l.to} className={styles.link}>{l.label}</Link>
                ) : (
                  <a href="#" className={styles.link}>{l.label}</a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.socialCol}>
          <h2 className={styles.colTitle}>Follow us</h2>
          <div className={styles.social}>
            <a href="#" aria-label="Facebook" className={styles.socialBtn}><Facebook size={18} /></a>
            <a href="#" aria-label="Instagram" className={styles.socialBtnAccent}><Instagram size={18} /></a>
            <a href="#" aria-label="LinkedIn" className={styles.socialBtn}><Linkedin size={18} /></a>
            <a href="#" aria-label="X" className={styles.socialBtnDark}>X</a>
          </div>
          <p className={styles.contact}>
            Contact: <a href={`mailto:${CONTACT_EMAIL}`} className={styles.email}>{CONTACT_EMAIL}</a>
          </p>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>{COPYRIGHT}</span>
        <nav className={styles.legal} aria-label="Legal">
          {LEGAL.map((l) => <a key={l} href="#" className={styles.legalLink}>{l}</a>)}
        </nav>
      </div>
    </footer>
  );
}
