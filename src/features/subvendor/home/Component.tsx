import { useNavigate } from 'react-router-dom';
import { Zap, Camera } from 'lucide-react';
import { dateLabel, formatINR } from '@features/subvendor/tasks/transform';
import type { ApiSubVendorTask } from './types';
import { TASKS_COPY } from './constants';
import styles from './styles.module.css';

export interface SubvendorHomeComponentProps {
  pending: ApiSubVendorTask[];
  active: ApiSubVendorTask[];
  completedCount: number;
  earnedThisMonth: number;
  respond: (bookingId: string, taskId: string, accept: boolean) => void;
  isResponding: boolean;
}

function PendingCard({
  task,
  onRespond,
  disabled,
}: {
  task: ApiSubVendorTask;
  onRespond: (accept: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <strong>{task.bookingTitle}</strong>
        <span className={styles.date}>{dateLabel(task.eventDate)}</span>
      </div>
      <p className={styles.taskTitle}>{task.title}</p>
      <p className={styles.meta}>
        {[task.organizer?.name, task.location].filter(Boolean).join(' · ')}
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.decline} disabled={disabled} onClick={() => onRespond(false)}>
          Decline
        </button>
        <button type="button" className={styles.accept} disabled={disabled} onClick={() => onRespond(true)}>
          Accept
        </button>
      </div>
    </div>
  );
}

function ActiveRow({ task }: { task: ApiSubVendorTask }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className={styles.activeRow}
      onClick={() => navigate(`/subvendor/tasks/${task.bookingId}/${task.id}`)}
    >
      <div className={styles.activeInfo}>
        <strong>{task.title}</strong>
        <span className={styles.meta}>{task.bookingTitle}</span>
      </div>
      <span className={`${styles.statusPill} ${task.status === 'in_progress' ? styles.statusOn : ''}`}>
        {task.status === 'in_progress' ? 'In progress' : 'To do'}
      </span>
      {task.photoProof && <Camera size={14} className={styles.proofIcon} />}
    </button>
  );
}

export function Component({
  pending,
  active,
  completedCount,
  earnedThisMonth,
  respond,
  isResponding,
}: SubvendorHomeComponentProps) {
  return (
    <section className={styles.wrap}>
      <h1 className={styles.title}>{TASKS_COPY.title}</h1>

      {pending.length > 0 && (
        <div className={styles.banner}>
          <Zap size={16} />
          <span>
            New task from {pending[0]?.organizer?.name || 'an organizer'} — {pending[0]?.title}
          </span>
        </div>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{TASKS_COPY.upcomingTitle}</h2>
        {pending.length ? (
          <div className={styles.grid}>
            {pending.map((t) => (
              <PendingCard
                key={t.id}
                task={t}
                disabled={isResponding}
                onRespond={(accept) => respond(t.bookingId, t.id, accept)}
              />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>{TASKS_COPY.upcomingEmpty}</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{TASKS_COPY.activeTitle}</h2>
        {active.length ? (
          <div className={styles.activeList}>
            {active.map((t) => (
              <ActiveRow key={t.id} task={t} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>{TASKS_COPY.activeEmpty}</p>
        )}
      </section>

      <div className={styles.footer}>
        <span>Completed this month</span>
        <strong>{completedCount} tasks</strong>
        <span className={styles.footerDot}>·</span>
        <strong>{formatINR(earnedThisMonth)}</strong>
      </div>
    </section>
  );
}
