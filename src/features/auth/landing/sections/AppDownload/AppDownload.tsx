import { Play, Apple, Star, Home, Search, MessageSquare, User } from 'lucide-react';
import { SECTION_COPY } from '../../constants';
import styles from './AppDownload.module.css';

const { appDownload } = SECTION_COPY;

/*
 * The phone is a product illustration of what the app looks like — `aria-hidden`
 * and captioned as an example. Its rows used to be fetched through a mock
 * `/events/featured` RTK endpoint, which made invented vendor names and a
 * "₹1.05L" figure indistinguishable from live data to anyone reading the code.
 * They are static illustration copy now, and named as such.
 */
const ILLUSTRATION_ROWS = [
  { id: 'row-1', title: 'Decoration', vendor: 'Your decorator', status: 'On track' },
  { id: 'row-2', title: 'Catering', vendor: 'Your caterer', status: 'Quoted' },
  { id: 'row-3', title: 'Photography', vendor: 'Your photographer', status: 'Booked' },
];

export function AppDownload() {
  return (
    <section className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.badge}><Star size={13} fill="currentColor" strokeWidth={0} /> {appDownload.badge}</span>
          <h2 className={styles.title}>
            <span>{appDownload.titleLead}</span>
            <span className={styles.accent}>{appDownload.titleAccent}</span>
          </h2>
          <p className={styles.desc}>{appDownload.description}</p>
          <div className={styles.stores}>
            <a href="#" className={styles.store}><Play size={20} fill="currentColor" /><span><small>GET IT ON</small>Google Play</span></a>
            <a href="#" className={styles.store}><Apple size={20} /><span><small>DOWNLOAD ON THE</small>App Store</span></a>
          </div>
        </div>

        <div className={styles.phone} aria-hidden>
          <div className={styles.phoneTop}>
            <span className={styles.phoneTag}>Example workspace</span>
          </div>
          <p className={styles.vendorsLabel}>Your vendors</p>
          <ul className={styles.vendors}>
            {ILLUSTRATION_ROWS.map((r) => (
              <li key={r.id} className={styles.vendor}>
                <div>
                  <strong>{r.title}</strong>
                  <span>{r.vendor}</span>
                </div>
                <span className={`${styles.status} ${r.status === 'On track' ? styles.statusGreen : ''}`}>{r.status}</span>
              </li>
            ))}
          </ul>
          <nav className={styles.tabbar}>
            <Home size={18} /><Search size={18} /><MessageSquare size={18} /><User size={18} />
          </nav>
          <div className={styles.homeBar}><span className={styles.homeIndicator} /></div>
        </div>
      </div>
    </section>
  );
}
