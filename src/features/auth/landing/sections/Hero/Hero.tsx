import { Sparkles } from 'lucide-react';
import { Button, Icon } from '@shared/reusable';
import { ParticleField } from '@shared/components';
import { HERO } from '../../constants';
import styles from './Hero.module.css';

/** Presentational hero. Static copy from constants; stat cards from props. */
export function Hero() {
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

        </div>

      </div>
    </section>
  );
}
