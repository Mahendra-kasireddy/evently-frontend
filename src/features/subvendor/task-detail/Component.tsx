import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Camera, Clock, MapPin, User } from 'lucide-react';
import { dateLabel, formatINR } from '@features/subvendor/tasks/transform';
import type { ApiSubVendorTask } from './types';
import styles from './styles.module.css';

export interface TaskDetailComponentProps {
  task: ApiSubVendorTask;
  onAccept: () => void;
  onDecline: () => void;
  onStart: () => void;
  onMarkDone: () => void;
  onUploadPhoto: (file: File) => void;
  isResponding: boolean;
  isUpdating: boolean;
  isUploading: boolean;
}

const STAGES = ['accepted', 'in_progress', 'done'] as const;

export function Component({
  task,
  onAccept,
  onDecline,
  onStart,
  onMarkDone,
  onUploadPhoto,
  isResponding,
  isUpdating,
  isUploading,
}: TaskDetailComponentProps) {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const stageIndex =
    task.assignmentStatus !== 'accepted' ? -1 : task.status === 'done' ? 2 : task.status === 'in_progress' ? 1 : 0;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button type="button" className={styles.back} onClick={() => navigate('/subvendor/home')}>
          <ArrowLeft size={15} /> Back to tasks
        </button>

        <section className={styles.card}>
          <h1 className={styles.title}>{task.title}</h1>
          <p className={styles.subtitle}>{task.bookingTitle} · {task.bookingRef}</p>

          {task.assignmentStatus === 'accepted' && (
            <div className={styles.stepper}>
              {STAGES.map((s, i) => (
                <span key={s} className={`${styles.step} ${i <= stageIndex ? styles.stepOn : ''}`}>
                  {i + 1}
                </span>
              ))}
            </div>
          )}

          <ul className={styles.rows}>
            <li><Calendar size={15} /> {dateLabel(task.eventDate)}</li>
            {task.dueDate && <li><Clock size={15} /> Due {dateLabel(task.dueDate)}</li>}
            <li><MapPin size={15} /> {task.location || 'Location not specified'}</li>
            <li><User size={15} /> {task.organizer?.name || 'Organizer'}</li>
          </ul>

          {task.amount > 0 && (
            <p className={styles.amount}>Agreed pay: <strong>{formatINR(task.amount)}</strong></p>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className={styles.hiddenInput}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUploadPhoto(file);
              e.target.value = '';
            }}
          />

          {task.assignmentStatus === 'pending' && (
            <div className={styles.actions}>
              <button type="button" className={styles.decline} disabled={isResponding} onClick={onDecline}>
                Decline
              </button>
              <button type="button" className={styles.accept} disabled={isResponding} onClick={onAccept}>
                Accept task
              </button>
            </div>
          )}

          {task.assignmentStatus === 'declined' && <p className={styles.declinedNote}>You declined this task.</p>}

          {task.assignmentStatus === 'accepted' && task.status !== 'done' && (
            <div className={styles.actions}>
              {task.photoProof ? (
                <span className={styles.proofOk}><Camera size={14} /> Photo attached</span>
              ) : (
                <button type="button" className={styles.proofBtn} disabled={isUploading} onClick={() => fileRef.current?.click()}>
                  <Camera size={14} /> {isUploading ? 'Uploading…' : 'Upload photo proof'}
                </button>
              )}
              {task.status === 'todo' && (
                <button type="button" className={styles.accept} disabled={isUpdating} onClick={onStart}>
                  Start task
                </button>
              )}
              {task.status === 'in_progress' && (
                <button type="button" className={styles.accept} disabled={isUpdating} onClick={onMarkDone}>
                  Mark as done
                </button>
              )}
            </div>
          )}

          {task.assignmentStatus === 'accepted' && task.status === 'done' && (
            <p className={styles.doneNote}>Completed.</p>
          )}
        </section>
      </div>
    </main>
  );
}
