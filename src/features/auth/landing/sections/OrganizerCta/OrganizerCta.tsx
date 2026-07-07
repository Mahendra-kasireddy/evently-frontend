import { Briefcase, ChevronRight, Check } from 'lucide-react';
import { SECTION_COPY } from '../../constants';
import common from '../../styles.module.css';
import styles from './OrganizerCta.module.css';

const { organizerCta } = SECTION_COPY;

/** Presentational organizer conversion section. Static copy from constants. */
export function OrganizerCta() {
  return (
    <section className={`${common.section} ${styles.wrap}`} id="organizers">
      <div className={common.container}>
        <div className={styles.grid}>
          <div>
            <span className={styles.badge}><Briefcase size={14} /> {organizerCta.badge}</span>
            <h2 className={styles.title}>
              <span>{organizerCta.titleLead}</span>{' '}
              <span className={styles.accent}>{organizerCta.titleAccent}</span>
            </h2>
            <p className={styles.desc}>{organizerCta.description}</p>
            <ul className={styles.perks}>
              {organizerCta.perks.map((p) => (
                <li key={p}><Check size={15} /> {p}</li>
              ))}
            </ul>
          </div>

          <div className={styles.cards}>
            <a href="#" className={styles.cardPrimary}>
              <span className={styles.cardIcon}><Briefcase size={20} /></span>
              <div><strong>Join as Organizer</strong><span>Manage bookings &amp; vendors</span></div>
              <ChevronRight size={18} />
            </a>
            <a href="#" className={styles.cardSecondary}>
              <span className={styles.cardIconAlt}><Briefcase size={20} /></span>
              <div><strong>Become a Sub-vendor</strong><span>Deliver tasks, get paid</span></div>
              <ChevronRight size={18} />
            </a>
            <p className={styles.note}><Check size={14} /> Free to join · 24–48h verification</p>
          </div>
        </div>
      </div>
    </section>
  );
}
