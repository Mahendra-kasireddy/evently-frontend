import { ArrowRight } from 'lucide-react';
import { AsyncSection } from '@shared/reusable';
import { Icon } from '@shared/reusable';
import { SECTION_COPY } from '../../constants';
import type { Category } from '../../types';
import common from '../../styles.module.css';
import styles from './Categories.module.css';

export interface CategoriesProps {
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
}

const { categories: copy } = SECTION_COPY;

export function Categories({ categories, isLoading, isError }: CategoriesProps) {
  return (
    <section className={styles.section} id="explore">
      <div className={common.container}>
        <div className={styles.head}>
          <div>
            <h2 className={common.sectionTitle} style={{ textAlign: 'left', marginBottom: 6 }}>{copy.title}</h2>
            <p className={common.sectionSubtitle}>{copy.subtitle}</p>
          </div>
          <a href="#explore" className={styles.cta}>{copy.cta} <ArrowRight size={16} /></a>
        </div>

        <ul className={styles.row}>
          <AsyncSection
            isLoading={isLoading}
            isError={isError}
            isEmpty={categories.length === 0}
            loading={Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className={`${styles.card} ${common.skeleton}`} style={{ height: 220 }} aria-hidden />
            ))}
          >
            {categories.map((c) => (
              <li key={c.id} className={styles.card}>
                <img src={c.imageUrl} alt="" className={styles.img} loading="lazy" />
                <div className={styles.overlay} />
                <span className={styles.icon}><Icon name={c.icon} size={18} /></span>
                <div className={styles.meta}>
                  <h3 className={styles.cardTitle}>{c.title}</h3>
                  <p className={styles.cardSub}>{c.subtitle}</p>
                </div>
              </li>
            ))}
          </AsyncSection>
        </ul>
      </div>
    </section>
  );
}
