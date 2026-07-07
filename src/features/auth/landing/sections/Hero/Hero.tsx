import { Sparkles, Star } from 'lucide-react';
import { Button, Icon } from '@shared/reusable';
import { ParticleField } from '@shared/components';
import { HERO } from '../../constants';
import type { Statistic } from '../../types';
import styles from './Hero.module.css';

export interface HeroProps {
  statistics: Statistic[];
  statsLoading: boolean;
}

/** Presentational hero. Static copy from constants; stat cards from props. */
export function Hero({ statistics, statsLoading }: HeroProps) {
  return (
    <section className={styles.hero} id="top">
      <div className={styles.bg} aria-hidden />
      <span className={` `} aria-hidden />
      <span className={` `} aria-hidden />
      <ParticleField density={44} />
      <div className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.badge}>
            <Icon name="shield-check" size={15} />
            {HERO.badge}
          </span>

          <h1 className={styles.title}>
            <span className={styles.titleLead}>{HERO.titleLead}</span>
            <span className={styles.titleAccent}>{HERO.titleAccent}</span>
          </h1>

          <p className={styles.subtitle}>{HERO.subtitle}</p>

          <div className={styles.ctaRow}>
            <Button variant="brand" size="lg">
              <Sparkles size={18} aria-hidden /> {HERO.primaryCta}
            </Button>
            <Button variant="brandGhost" size="lg">{HERO.secondaryCta}</Button>
          </div>

          <div className={styles.proof}>
            <div className={styles.avatars} aria-hidden>
              {['PR', 'AM', 'LR', 'KV'].map((i, idx) => (
                <span key={i} className={styles.avatar} data-i={idx}>{i}</span>
              ))}
            </div>
            <div className={styles.rating}>
              <span className={styles.stars} aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </span>
              <span><strong>{HERO.ratingValue}</strong> {HERO.ratingLabel}</span>
            </div>
          </div>
        </div>

        <ul className={styles.statCards} aria-label="Highlights">
          {statsLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className={`${styles.statCard} ${styles.statSkeleton}`} aria-hidden />
              ))
            : statistics.map((s) => (
                <li key={s.id} className={styles.statCard}>
                  <span className={styles.statIcon}><Icon name={s.icon} size={18} /></span>
                  <div>
                    <strong className={styles.statValue}>{s.value}</strong>
                    <span className={styles.statLabel}>{s.label}</span>
                  </div>
                </li>
              ))}
        </ul>
      </div>
    </section>
  );
}
