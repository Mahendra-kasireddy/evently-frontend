import { Sparkles, Plus } from 'lucide-react';
import type { IdeasConfig } from '../../types';
import styles from './IdeasRequests.module.css';

export interface IdeasRequestsProps {
  config: IdeasConfig;
  value: string;
  onAdd: (suggestion: string) => void;
  onChange: (value: string) => void;
}

export function IdeasRequests({ config, value, onAdd, onChange }: IdeasRequestsProps) {
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.icon}><Sparkles size={16} /></span>
        <h3 className={styles.title}>{config.title}</h3>
      </div>
      <p className={styles.subtitle}>{config.subtitle}</p>
      <div className={styles.chips}>
        {config.suggestions.map((s) => (
          <button key={s} type="button" className={styles.chip} onClick={() => onAdd(s)}>
            <Plus size={14} /> {s}
          </button>
        ))}
      </div>
      <textarea
        className={styles.textarea}
        value={value}
        placeholder={config.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
