import { Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BookedEventData } from '../../types';
import styles from './BookedEvent.module.css';

/** Per-user active booking (from the home feed). Hidden when there's none. */
export function BookedEvent({ data }: { data?: BookedEventData | undefined }) {
  const navigate = useNavigate();
  if (!data) return null;

  const radius = 34;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - data.progress / 100);

  return (
    <section className={styles.card}>
      <div className={styles.ring}>
        <svg width="84" height="84" viewBox="0 0 84 84" className={styles.ringSvg}>
          <circle cx="42" cy="42" r={radius} className={styles.ringTrack} />
          <circle
            cx="42" cy="42" r={radius} className={styles.ringFill}
            strokeDasharray={circ} strokeDashoffset={offset}
            transform="rotate(-90 42 42)"
          />
        </svg>
        <span className={styles.ringText}>
          <strong>{data.progress}%</strong>
          <small>ready</small>
        </span>
      </div>

      <div className={styles.body}>
        <span className={styles.ref}>{data.ref}</span>
        <h2 className={styles.title}>{data.title}</h2>
        <p className={styles.desc}>{data.description}</p>
        <ul className={styles.steps}>
          {data.steps.map((s) => (
            <li key={s.label} className={`${styles.step} ${s.done ? styles.done : ''}`}>
              <span className={styles.stepDot}>{s.done && <Check size={12} strokeWidth={3} />}</span>
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.aside}>
        <div className={styles.days}>
          <strong>{data.daysToGo}</strong>
          <small>days to go</small>
        </div>
        <button type="button" className={styles.cta} onClick={() => navigate('/workspace')}>
          <ChevronRight size={16} /> Open workspace
        </button>
      </div>
    </section>
  );
}
