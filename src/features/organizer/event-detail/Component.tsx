import { Link } from 'react-router-dom';
import { Check, ChevronRight, Clock, Heart, MessageSquare, Plus, ShieldCheck, X } from 'lucide-react';
import { Avatar, Btn, Card, formatInr } from '@shared/partner';
import { dateLabel } from '@features/organizer/bookings/transform';
import { TaskBoard, IdeaSummary } from './sections';
import {
  COMPLETABLE_STATUSES,
  RESPONDABLE_STATUSES,
  CONFIRM_COPY,
  EVENT_DETAIL_COPY as COPY,
  countdownLabel,
} from './constants';
import type { ApiBooking, BookingTaskStatus } from './types';
import type { IdeaCounts } from '@features/board';
import styles from './styles.module.css';

export interface EventDetailComponentProps {
  booking: ApiBooking;
  subvendors: Array<{ id: string; fullName: string }>;
  newTaskTitle: string;
  setNewTaskTitle: (v: string) => void;
  newTaskSubVendorId: string;
  setNewTaskSubVendorId: (v: string) => void;
  newTaskAmount: string;
  setNewTaskAmount: (v: string) => void;
  onAddTask: () => void;
  isAddingTask: boolean;
  onMoveTask: (taskId: string, status: BookingTaskStatus) => void;
  onRemoveTask: (taskId: string) => void;
  onAssignTask: (taskId: string, subVendorId: string | null) => void;
  onUploadProof: (taskId: string, file: File) => void;
  onMarkCompleted: () => void;
  isCompleting: boolean;
  declineReason: string;
  setDeclineReason: (v: string) => void;
  onAcceptBooking: () => void;
  onDeclineBooking: () => void;
  isResponding: boolean;
  /** Real counts from the ideas board; the feed itself has its own screen. */
  ideaCounts: IdeaCounts;
  onOpenIdeaBoard: () => void;
}

export function Component({
  booking,
  subvendors,
  newTaskTitle,
  setNewTaskTitle,
  newTaskSubVendorId,
  setNewTaskSubVendorId,
  newTaskAmount,
  setNewTaskAmount,
  onAddTask,
  isAddingTask,
  onMoveTask,
  onRemoveTask,
  onAssignTask,
  onUploadProof,
  onMarkCompleted,
  isCompleting,
  declineReason,
  setDeclineReason,
  onAcceptBooking,
  onDeclineBooking,
  isResponding,
  ideaCounts,
  onOpenIdeaBoard,
}: EventDetailComponentProps) {
  const name = booking.title || booking.occasion || 'Event';
  // The design's identity line: date · venue · reference. Each part is dropped
  // when the booking doesn't carry it, so the separator never dangles.
  const identity = [dateLabel(booking.eventDate), booking.location, booking.ref ? `ID ${booking.ref}` : '']
    .filter(Boolean)
    .join(' · ');
  const canComplete = COMPLETABLE_STATUSES.has(booking.status);
  const mustRespond = RESPONDABLE_STATUSES.has(booking.status);

  return (
    <div className={styles.page}>
      <Card className={styles.header}>
        <Avatar name={name} size={44} square bg="var(--c-navy)" />
        <div className={styles.headerText}>
          <h2 className={styles.eventName}>{name}</h2>
          {identity && <p className={styles.identity}>{identity}</p>}
        </div>
        <div className={styles.headerRight}>
          <div className={styles.value}>
            <span className={styles.valueLabel}>{COPY.totalValue}</span>
            <span className={styles.valueAmount}>{formatInr(booking.amount)}</span>
          </div>
          <Btn kind="navy" icon={<MessageSquare size={15} />} disabled title={COPY.chatUnavailable}>
            {COPY.chat}
          </Btn>
        </div>
      </Card>

      {/* The accept/decline gate. Without it a paid booking had no way to
          leave "awaiting organizer" anywhere in the product. */}
      {mustRespond && (
        <section className={styles.confirm}>
          <div className={styles.confirmHead}>
            <span className={styles.confirmIcon}>
              <ShieldCheck size={18} />
            </span>
            <div className={styles.confirmText}>
              <strong>{CONFIRM_COPY.title}</strong>
              <span>{CONFIRM_COPY.body}</span>
              {booking.organizerRespondBy && (
                <em className={styles.confirmDeadline}>
                  {CONFIRM_COPY.deadline(booking.organizerRespondBy)}
                </em>
              )}
            </div>
          </div>
          <div className={styles.confirmActions}>
            <input
              type="text"
              className={styles.confirmReason}
              placeholder={CONFIRM_COPY.reasonPlaceholder}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              maxLength={500}
            />
            <Btn
              kind="outline"
              icon={<X size={14} />}
              onClick={onDeclineBooking}
              disabled={isResponding}
            >
              {isResponding ? CONFIRM_COPY.declining : CONFIRM_COPY.decline}
            </Btn>
            <Btn
              kind="teal"
              icon={<Check size={15} />}
              onClick={onAcceptBooking}
              disabled={isResponding}
            >
              {isResponding ? CONFIRM_COPY.accepting : CONFIRM_COPY.accept}
            </Btn>
          </div>
        </section>
      )}

      <div className={styles.countdown}>
        <Clock size={18} className={styles.countdownIcon} />
        <span className={styles.countdownText}>{countdownLabel(booking.daysToGo, booking.status)}</span>
        {canComplete && (
          <Btn
            kind="teal"
            sm
            icon={<Check size={14} />}
            onClick={onMarkCompleted}
            disabled={isCompleting}
            className={styles.completeBtn}
          >
            {isCompleting ? COPY.marking : COPY.markCompleted}
          </Btn>
        )}
      </div>

      <Link to={`/organizer/invitation/${booking.id}`} className={styles.invitation}>
        <span className={styles.invitationIcon}>
          <Heart size={20} />
        </span>
        <span className={styles.invitationText}>
          <span className={styles.invitationTitle}>{COPY.invitationTitle}</span>
          <span className={styles.invitationSub}>{COPY.invitationSub}</span>
        </span>
        <ChevronRight size={18} className={styles.invitationChevron} />
      </Link>

      <form
        className={styles.addTask}
        onSubmit={(e) => {
          e.preventDefault();
          onAddTask();
        }}
      >
        <input
          type="text"
          className={styles.addInput}
          placeholder={COPY.addTaskPlaceholder}
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        {subvendors.length > 0 && (
          <select
            className={styles.addSelect}
            aria-label="Assign to sub-vendor"
            value={newTaskSubVendorId}
            onChange={(e) => setNewTaskSubVendorId(e.target.value)}
          >
            <option value="">{COPY.unassigned}</option>
            {subvendors.map((sv) => (
              <option key={sv.id} value={sv.id}>
                {sv.fullName}
              </option>
            ))}
          </select>
        )}
        {newTaskSubVendorId && (
          <input
            type="number"
            min="0"
            className={styles.addAmount}
            aria-label="Sub-vendor pay"
            placeholder="₹ pay"
            value={newTaskAmount}
            onChange={(e) => setNewTaskAmount(e.target.value)}
          />
        )}
        <Btn sm type="submit" icon={<Plus size={14} />} disabled={!newTaskTitle.trim() || isAddingTask}>
          Add task
        </Btn>
      </form>

      <TaskBoard
        tasks={booking.tasks}
        subvendors={subvendors}
        onMove={onMoveTask}
        onRemove={onRemoveTask}
        onAssign={onAssignTask}
        onUploadProof={onUploadProof}
      />

      <IdeaSummary
        counts={ideaCounts}
        clientName={booking.customer?.name ?? 'Your client'}
        onOpen={onOpenIdeaBoard}
      />
    </div>
  );
}

export default Component;
