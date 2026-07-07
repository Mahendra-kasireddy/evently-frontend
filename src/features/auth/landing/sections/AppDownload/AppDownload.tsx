import { Play, Apple, Star, Home, Search, MessageSquare, User } from 'lucide-react';
import { AsyncSection } from '@shared/reusable';
import { SECTION_COPY } from '../../constants';
import type { FeaturedEvent } from '../../types';
import styles from './AppDownload.module.css';

export interface AppDownloadProps {
  vendors: FeaturedEvent[];
  isLoading: boolean;
  isError: boolean;
}

const { appDownload } = SECTION_COPY;

export function AppDownload({ vendors, isLoading, isError }: AppDownloadProps) {
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
            <span className={styles.phoneTag}>Sharma Events · on track</span>
          </div>
          <p className={styles.vendorsLabel}>Your vendors</p>
          <ul className={styles.vendors}>
            <AsyncSection
              isLoading={isLoading}
              isError={isError}
              loading={Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className={styles.vendorSkel} />
              ))}
            >
              {vendors.map((v) => (
                <li key={v.id} className={styles.vendor}>
                  <img src={v.imageUrl} alt="" className={styles.vendorImg} />
                  <div>
                    <strong>{v.title}</strong>
                    <span>{v.vendorName}</span>
                  </div>
                  <span className={`${styles.status} ${v.status === 'On track' ? styles.statusGreen : ''}`}>{v.status}</span>
                </li>
              ))}
            </AsyncSection>
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
