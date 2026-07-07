import { Heart, Gift, Home, Sparkles, Star, Briefcase, Check, type LucideIcon } from 'lucide-react';
import { OccasionArt, Confetti } from '@shared/reusable';
import { ART_GRADIENT } from '../../constants';
import type { PlanOccasion } from '../../types';
import styles from './OccasionPicker.module.css';

const ICON: Record<string, LucideIcon> = { wedding: Heart, birthday: Gift, housewarming: Home, naming: Sparkles, anniversary: Star, corporate: Briefcase };

export interface OccasionPickerProps {
  occasions: PlanOccasion[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function OccasionPicker({ occasions, selectedId, onSelect }: OccasionPickerProps) {
  return (
    <div className={styles.block}>
      <h2 className={styles.title}>What are we celebrating?</h2>
      <div className={styles.grid}>
        {occasions.map((o) => {
          const Icon = ICON[o.id] ?? Heart;
          const on = o.id === selectedId;
          return (
            <button key={o.id} type="button" className={`${styles.card} ${on ? styles.cardOn : ''}`} style={{ backgroundImage: ART_GRADIENT[o.art] }} onClick={() => onSelect(o.id)}>
              <span className={styles.art} aria-hidden><Confetti /><OccasionArt art={o.art} /></span>
              <span className={styles.icon}><Icon size={15} /></span>
              {on && <span className={styles.check}><Check size={13} strokeWidth={3} /></span>}
              <span className={styles.label}>{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
