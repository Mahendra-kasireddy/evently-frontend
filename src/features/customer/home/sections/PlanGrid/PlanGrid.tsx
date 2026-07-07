import { Heart, Gift, Home, Sparkles, Star, Briefcase, ChevronRight, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { PlanSection, OccasionIcon, OccasionArt as ArtKey } from '../../types';
import { OccasionArt, Confetti } from '@shared/reusable';
import styles from './PlanGrid.module.css';

const ICONS: Record<OccasionIcon, LucideIcon> = {
  heart: Heart, gift: Gift, home: Home, sparkles: Sparkles, star: Star, briefcase: Briefcase,
};

const GRADIENTS: Record<ArtKey, string> = {
  wedding: 'linear-gradient(165deg, #243a6b, #0e1a33)',
  birthday: 'linear-gradient(165deg, #5a2a30, #2a1216)',
  housewarming: 'linear-gradient(165deg, #16403a, #08201c)',
  naming: 'linear-gradient(165deg, #3a2a5e, #181233)',
  anniversary: 'linear-gradient(165deg, #5a3c1c, #2e2010)',
  corporate: 'linear-gradient(165deg, #243a6b, #0e1a33)',
};

export interface PlanGridProps {
  data: PlanSection;
}

export function PlanGrid({ data }: PlanGridProps) {
  const navigate = useNavigate();
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{data.title}</h2>
      <p className={styles.subtitle}>{data.subtitle}</p>
      <ul className={styles.deck}>
        {data.occasions.map((o) => {
          const Icon = ICONS[o.icon] ?? Heart;
          const go = () => navigate(`/plan?occasion=${o.id}`);
          return (
            <li
              key={o.id}
              className={styles.card}
              style={{ backgroundImage: GRADIENTS[o.art] }}
              role="button"
              tabIndex={0}
              onClick={go}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  go();
                }
              }}
            >
              <span className={styles.confetti} aria-hidden><Confetti /></span>
              <span className={styles.art} aria-hidden><OccasionArt art={o.art} /></span>
              <span className={styles.icon}><Icon size={16} /></span>
              <span className={styles.meta}>
                <strong className={styles.cardTitle}>{o.label}</strong>
                <span className={styles.cardCta}>{o.cta} <ChevronRight size={13} /></span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
