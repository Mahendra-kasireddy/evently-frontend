import { useRef, useState } from 'react';
import { Camera, Check, Plus, Trash2, Undo2 } from 'lucide-react';
import { Avatar } from '@shared/partner';
import { dateLabel, taskStatusLabel } from '@features/organizer/bookings/transform';
import { COLUMN_ACCENT, EVENT_DETAIL_COPY as COPY, TASK_COLUMNS } from '../../constants';
import type { ApiBookingTask, BookingTaskStatus } from '../../types';
import styles from './TaskBoard.module.css';

export interface SubVendorOption {
  id: string;
  fullName: string;
}

export interface TaskBoardProps {
  tasks: ApiBookingTask[];
  subvendors: SubVendorOption[];
  onMove: (taskId: string, status: BookingTaskStatus) => void;
  onRemove: (taskId: string) => void;
  onAssign: (taskId: string, subVendorId: string | null) => void;
  onUploadProof: (taskId: string, file: File) => void;
}

/**
 * The right-hand label on a card. The design shows a due date on open work and
 * the literal word "Completed" once a task is done.
 */
function trailingLabel(task: ApiBookingTask): string {
  if (task.status === 'done') return 'Completed';
  return dateLabel(task.dueDate);
}

function AssignControl({
  task,
  subvendors,
  onAssign,
}: {
  task: ApiBookingTask;
  subvendors: SubVendorOption[];
  onAssign: (subVendorId: string | null) => void;
}) {
  const [picking, setPicking] = useState(false);

  // The design's resting card shows only avatar + name; unassigning lives in
  // the hover action row so the row itself stays clean.
  if (task.assigneeName) {
    return (
      <span className={styles.assignee}>
        <Avatar name={task.assigneeName} size={22} />
        <span className={styles.assigneeName}>{task.assigneeName}</span>
      </span>
    );
  }

  // Nobody to pick from yet — invite the organizer to link a sub-vendor first
  // rather than opening an empty menu.
  if (subvendors.length === 0) {
    return <span className={styles.noVendors}>{COPY.unassigned}</span>;
  }

  if (!picking) {
    return (
      <button type="button" className={styles.assign} onClick={() => setPicking(true)}>
        <Plus size={13} />
        {COPY.assign}
      </button>
    );
  }

  return (
    <select
      className={styles.assignSelect}
      autoFocus
      defaultValue=""
      aria-label={`Assign task: ${task.title}`}
      onBlur={() => setPicking(false)}
      onChange={(e) => {
        if (e.target.value) onAssign(e.target.value);
        setPicking(false);
      }}
    >
      <option value="" disabled>
        Choose sub-vendor
      </option>
      {subvendors.map((sv) => (
        <option key={sv.id} value={sv.id}>
          {sv.fullName}
        </option>
      ))}
    </select>
  );
}

function TaskCard({
  task,
  subvendors,
  onMove,
  onRemove,
  onAssign,
  onUploadProof,
}: {
  task: ApiBookingTask;
  subvendors: SubVendorOption[];
  onMove: (status: BookingTaskStatus) => void;
  onRemove: () => void;
  onAssign: (subVendorId: string | null) => void;
  onUploadProof: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const trailing = trailingLabel(task);

  return (
    <div className={styles.card}>
      <p className={styles.cardTitle}>{task.title}</p>

      <div className={styles.cardRow}>
        <AssignControl task={task} subvendors={subvendors} onAssign={onAssign} />
        {trailing && (
          <span className={styles.due} style={{ color: COLUMN_ACCENT[task.status] }}>
            {trailing}
          </span>
        )}
      </div>

      {task.subVendorId && task.assignmentStatus !== 'unassigned' && (
        <span className={`${styles.assignTag} ${styles[task.assignmentStatus] ?? ''}`}>
          {task.assignmentStatus === 'pending' && 'Awaiting sub-vendor'}
          {task.assignmentStatus === 'accepted' && 'Accepted'}
          {task.assignmentStatus === 'declined' && 'Declined'}
        </span>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUploadProof(file);
          e.target.value = '';
        }}
      />

      {task.photoProof ? (
        <a href={task.photoProof.url} target="_blank" rel="noreferrer" className={styles.proofLink}>
          <Camera size={14} /> {COPY.proofAttached}
        </a>
      ) : (
        // The design shows the dashed dropzone only on work still in flight.
        task.status !== 'done' && (
          <button type="button" className={styles.proofZone} onClick={() => fileRef.current?.click()}>
            <Camera size={14} /> {COPY.uploadProof}
          </button>
        )
      )}

      <div className={styles.cardActions}>
        {task.subVendorId && (
          <button type="button" className={styles.iconBtn} onClick={() => onAssign(null)} title={COPY.unassign}>
            {COPY.unassign}
          </button>
        )}
        {task.status !== 'todo' && (
          <button type="button" className={styles.iconBtn} onClick={() => onMove('todo')} title="Move to To do">
            <Undo2 size={13} />
          </button>
        )}
        {task.status !== 'in_progress' && (
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => onMove('in_progress')}
            title="Move to In progress"
          >
            {task.status === 'todo' ? 'Start' : 'Reopen'}
          </button>
        )}
        {task.status !== 'done' && (
          <button type="button" className={styles.doneBtn} onClick={() => onMove('done')} title="Mark done">
            <Check size={13} /> Done
          </button>
        )}
        <button type="button" className={styles.removeBtn} onClick={onRemove} title="Remove task">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export function TaskBoard({ tasks, subvendors, onMove, onRemove, onAssign, onUploadProof }: TaskBoardProps) {
  return (
    <div className={styles.board}>
      {TASK_COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col);
        return (
          <section key={col} className={styles.column} aria-label={taskStatusLabel(col)}>
            <div className={styles.columnHead}>
              <span className={styles.dot} style={{ background: COLUMN_ACCENT[col] }} aria-hidden />
              <strong className={styles.columnTitle}>{taskStatusLabel(col)}</strong>
              <span className={styles.count}>{items.length}</span>
            </div>
            {items.length === 0 ? (
              <p className={styles.empty}>{COPY.emptyColumn}</p>
            ) : (
              items.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  subvendors={subvendors}
                  onMove={(status) => onMove(t.id, status)}
                  onRemove={() => onRemove(t.id)}
                  onAssign={(subVendorId) => onAssign(t.id, subVendorId)}
                  onUploadProof={(file) => onUploadProof(t.id, file)}
                />
              ))
            )}
          </section>
        );
      })}
    </div>
  );
}

export default TaskBoard;
