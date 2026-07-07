import { type ReactNode } from 'react';
import { Sparkles, FileText, Heart, ShieldCheck } from 'lucide-react';
import { ParticleField } from '@shared/components';
import { PROMO } from '../../constants';
import styles from './LoginPromo.module.css';

const ICONS: Record<string, ReactNode> = {
  sparkles: <Sparkles size={18} />,
  'file-text': <FileText size={18} />,
  heart: <Heart size={18} />,
};

/** Left promo panel of the login card. Presentational, static copy. */
export function LoginPromo() {
  return (
    <div className={styles.promo}>
      <ParticleField density={22} />
      <div className={styles.inner}>
        <span className={styles.badge}><ShieldCheck size={14} /> {PROMO.badge}</span>
        <h2 className={styles.title}>
          {PROMO.titleLead} <span className={styles.accent}>{PROMO.titleAccent}</span>
        </h2>
        <p className={styles.desc}>{PROMO.description}</p>

        <ul className={styles.features}>
          {PROMO.features.map((f) => (
            <li key={f.text}>
              <span className={styles.fIcon}>{ICONS[f.icon]}</span>
              {f.text}
            </li>
          ))}
        </ul>

        <div className={styles.proof}>
          <div className={styles.avatars} aria-hidden>
            <span>A</span><span>R</span><span>P</span>
          </div>
          <p><strong>{PROMO.proofValue}</strong> {PROMO.proofLabel}</p>
        </div>
      </div>
    </div>
  );
}
