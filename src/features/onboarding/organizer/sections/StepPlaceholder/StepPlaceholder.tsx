import { Lock } from 'lucide-react';
import styles from './StepPlaceholder.module.css';

export function StepPlaceholder({ title }: { title: string }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon}><Lock size={22} /></span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>Complete the previous steps to unlock this section. It will guide you through {title.toLowerCase()}.</p>
    </div>
  );
}
