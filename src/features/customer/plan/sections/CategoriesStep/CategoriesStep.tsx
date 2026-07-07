import { Utensils, Droplet, Flower2, Camera, Music, Flame, Hand, Truck, Check, type LucideIcon } from 'lucide-react';
import type { PlanCategory, CategoryIcon } from '../../types';
import styles from './CategoriesStep.module.css';

const ICON: Record<CategoryIcon, LucideIcon> = { food: Utensils, water: Droplet, decor: Flower2, photo: Camera, music: Music, priest: Flame, mehendi: Hand, transport: Truck };

export interface CategoriesStepProps {
  occasionLabel: string;
  categories: PlanCategory[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function CategoriesStep({ occasionLabel, categories, selected, onToggle }: CategoriesStepProps) {
  return (
    <div className={styles.block}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>What do you need for your {occasionLabel}?</h2>
          <p className={styles.subtitle}>Tap the categories you want organizers to quote.</p>
        </div>
        <span className={styles.counter}>{selected.length} of {categories.length}</span>
      </div>
      <div className={styles.grid}>
        {categories.map((c) => {
          const Icon = ICON[c.icon];
          const on = selected.includes(c.id);
          return (
            <button key={c.id} type="button" className={`${styles.card} ${on ? styles.on : ''}`} onClick={() => onToggle(c.id)}>
              <span className={styles.icon}><Icon size={18} /></span>
              <span className={styles.text}>
                <strong>{c.title}</strong>
                <small>{c.subtitle}</small>
              </span>
              <span className={`${styles.check} ${on ? styles.checkOn : ''}`}>{on && <Check size={13} strokeWidth={3} />}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
