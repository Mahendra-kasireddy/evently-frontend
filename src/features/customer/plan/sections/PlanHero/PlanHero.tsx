import { Zap, Shield, CalendarDays, type LucideIcon } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';
import { OccasionArt, Confetti, type ArtKey } from '@shared/reusable';
import { ART_GRADIENT } from '../../constants';
import type { PlanTrust, TrustIcon } from '../../types';
import styles from './PlanHero.module.css';

const TRUST_ICON: Record<TrustIcon, LucideIcon> = { zap: Zap, shield: Shield, calendar: CalendarDays };

export interface PlanHeroProps {
  eyebrow: string;
  headingLead: string;
  headingAccent?: string;
  headingTail?: string;
  subtitle: string;
  trust: PlanTrust[];
  side?: { art: ArtKey; label: string };
  onBack: () => void;
}

export function PlanHero({ eyebrow, headingLead, headingAccent, headingTail, subtitle, trust, side, onBack }: PlanHeroProps) {
  return (
    <section className={styles.hero}>
      <span className={styles.decor} aria-hidden><span className={styles.glow} /></span>
      <div className={styles.left}>
        <button type="button" className={styles.back} onClick={onBack} aria-label="Back"><ChevronLeft size={18} /></button>
        <div className={styles.content}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1 className={styles.heading}>
            {headingLead}
            {headingAccent && <em className={styles.accent}>{headingAccent}</em>}
            {headingTail}
          </h1>
          <p className={styles.subtitle}>{subtitle}</p>
          {trust.length > 0 && (
            <div className={styles.trust}>
              {trust.map((t) => { const Icon = TRUST_ICON[t.icon]; return (
                <span key={t.label} className={styles.trustItem}><Icon size={15} /> {t.label}</span>
              ); })}
            </div>
          )}
        </div>
      </div>
      {side && (
        <div className={styles.sideCard} style={{ backgroundImage: ART_GRADIENT[side.art] }}>
          <span className={styles.sideArt} aria-hidden><Confetti /><OccasionArt art={side.art} /></span>
          <span className={styles.sideLabel}>{side.label}</span>
        </div>
      )}
    </section>
  );
}
