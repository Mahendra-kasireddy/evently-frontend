import { useState } from 'react';
import { Utensils, Droplet, Flower2, Camera, Music, Package, ChevronDown, type LucideIcon } from 'lucide-react';
import type { LineItem, LineIcon } from '../../types';
import styles from './ItemizedBreakdown.module.css';

const ICON: Record<LineIcon, LucideIcon> = { food: Utensils, water: Droplet, decor: Flower2, photo: Camera, music: Music, other: Package };

export function ItemizedBreakdown({ items }: { items: LineItem[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  return (
    <div className={styles.block}>
      <h2 className={styles.title}>Itemized breakdown</h2>
      <div className={styles.list}>
        {items.map((it) => {
          const Icon = ICON[it.icon];
          const expanded = open === it.id;
          return (
            <div key={it.id} className={`${styles.card} ${expanded ? styles.cardOpen : ''}`}>
              <button type="button" className={styles.head} onClick={() => setOpen(expanded ? null : it.id)}>
                <span className={styles.icon}><Icon size={18} /></span>
                <span className={styles.titleCol}><strong>{it.title}</strong><small>{it.subtitle}</small></span>
                <span className={styles.price}>{it.price}</span>
                <ChevronDown size={18} className={`${styles.caret} ${expanded ? styles.caretOpen : ''}`} />
              </button>
              {expanded && (
                <div className={styles.body}>
                  <ul className={styles.subList}>
                    {it.subItems.map((s) => (
                      <li key={s.label}><span>{s.label}</span><span className={styles.subVal}>{s.value}</span></li>
                    ))}
                  </ul>
                  {it.note && <p className={styles.note}>&ldquo;{it.note}&rdquo;</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
