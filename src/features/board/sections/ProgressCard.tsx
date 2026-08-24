import { plannedPercent, shortDate } from '../constants';
import type { IdeaCounts } from '../types';
import styles from '../board.module.css';

const RING = 84;
const STROKE = 8;
const RADIUS = (RING - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

export interface ProgressCardProps {
  counts: IdeaCounts;
  /** The booking's event date, ISO. */
  eventDate?: string | undefined;
}

/**
 * How much of what the customer asked for has become a plan.
 *
 * The ring is `planned / shared` from the server's own counts. The date line
 * states the event day rather than judging whether the event is "on track" —
 * that would need the task board, not the idea board.
 */
export function ProgressCard({ counts, eventDate }: ProgressCardProps) {
  const pct = plannedPercent(counts.planned, counts.shared);
  const offset = CIRC * (1 - pct / 100);
  const day = shortDate(eventDate);

  return (
    <section className={`${styles.railCard} ${styles.progress}`}>
      <div className={styles.ringWrap}>
        <svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`} aria-hidden="true">
          <circle cx={RING / 2} cy={RING / 2} r={RADIUS} className={styles.ringTrack} strokeWidth={STROKE} />
          <circle
            cx={RING / 2}
            cy={RING / 2}
            r={RADIUS}
            className={styles.ringFill}
            strokeWidth={STROKE}
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
          />
        </svg>
        <span className={styles.ringText}>{pct}%</span>
      </div>
      <div className={styles.progressBody}>
        <strong>Planning progress</strong>
        <span>
          {counts.shared === 0
            ? 'No ideas shared yet'
            : `${counts.planned} of ${counts.shared} ${counts.shared === 1 ? 'idea' : 'ideas'} turned into tasks`}
        </span>
        {day && <span className={styles.progressDate}>Event day · {day}</span>}
      </div>
    </section>
  );
}

export default ProgressCard;
