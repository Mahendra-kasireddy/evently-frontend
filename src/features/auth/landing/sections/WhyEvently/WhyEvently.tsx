import { AsyncSection } from '@shared/reusable';
import { Icon } from '@shared/reusable';
import { SECTION_COPY } from '../../constants';
import type { Feature } from '../../types';
import common from '../../styles.module.css';
import styles from './WhyEvently.module.css';

export interface WhyEventlyProps {
  features: Feature[];
  isLoading: boolean;
  isError: boolean;
}

export function WhyEvently({ features, isLoading, isError }: WhyEventlyProps) {
  return (
    <section className={styles.section}>
      <div className={common.container}>
        <div className={common.sectionHead}>
          <h2 className={common.sectionTitle}>{SECTION_COPY.whyEvently.title}</h2>
        </div>
        <ul className={styles.grid}>
          <AsyncSection
            isLoading={isLoading}
            isError={isError}
            isEmpty={features.length === 0}
            loading={Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className={`${styles.card} ${common.skeleton}`} style={{ height: 150 }} aria-hidden />
            ))}
          >
            {features.map((f) => (
              <li key={f.id} className={styles.card}>
                <span className={styles.icon}><Icon name={f.icon} size={20} /></span>
                <h3 className={styles.cardTitle}>{f.title}</h3>
                <p className={styles.cardDesc}>{f.description}</p>
              </li>
            ))}
          </AsyncSection>
        </ul>
      </div>
    </section>
  );
}
