import { Link } from 'react-router-dom';
import {
  CalendarClock,
  Check,
  ChevronRight,
  Heart,
  ListChecks,
  MessageSquare,
  Plus,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react';
import { Avatar, Btn, Card, formatInr } from '@shared/partner';
import {
  bookingStatusLabel,
  dateLabel,
} from '@features/organizer/bookings/transform';
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
  const identity = [
    dateLabel(booking.eventDate),
    booking.location,
    booking.ref ? `ID ${booking.ref}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
  const canComplete = COMPLETABLE_STATUSES.has(booking.status);
  const mustRespond = RESPONDABLE_STATUSES.has(booking.status);
  const doneTasks = booking.tasks.filter((t) => t.status === 'done').length;
  const totalTasks = booking.tasks.length;
  const taskPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  /*
   * Top to bottom, in the order an organizer works the event:
   *   1. what it is and where it stands (the summary card)
   *   2. anything waiting on them (accept / decline)
   *   3. the two things they build with the customer (invitation, ideas)
   *   4. the work itself (tasks)
   */
  return (
    <div className={styles.page}>
      <Card className={styles.hero}>
        <div className={styles.heroTop}>
          <Avatar name={name} size={48} square bg="var(--c-navy)" />
          <div className={styles.headerText}>
            <h2 className={styles.eventName}>{name}</h2>
            {identity && <p className={styles.identity}>{identity}</p>}
          </div>
          <span
            className={`${styles.statusChip} ${mustRespond ? styles.statusWait : ''}`}
          >
            {bookingStatusLabel(booking.status)}
          </span>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <Wallet size={16} className={styles.statIcon} />
            <span className={styles.statLabel}>{COPY.totalValue}</span>
            <span className={styles.statValue}>
              {formatInr(booking.amount)}
            </span>
          </div>
          <div className={styles.stat}>
            <CalendarClock size={16} className={styles.statIcon} />
            <span className={styles.statLabel}>Event day</span>
            <span className={styles.statValueSm}>
              {countdownLabel(booking.daysToGo, booking.status)}
            </span>
          </div>
          <div className={styles.stat}>
            <ListChecks size={16} className={styles.statIcon} />
            <span className={styles.statLabel}>Tasks</span>
            <span className={styles.statValue}>
              {doneTasks}/{totalTasks}
            </span>
          </div>
        </div>

        {totalTasks > 0 && (
          <div
            className={styles.progress}
            aria-label={`${taskPct}% of tasks done`}
          >
            <span
              className={styles.progressFill}
              style={{ width: `${taskPct}%` }}
            />
          </div>
        )}

        <div className={styles.heroActions}>
          {canComplete && (
            <Btn
              kind="teal"
              icon={<Check size={15} />}
              onClick={onMarkCompleted}
              disabled={isCompleting}
              className={styles.heroBtn}
            >
              {isCompleting ? COPY.marking : COPY.markCompleted}
            </Btn>
          )}
          <Btn
            kind="outline"
            icon={<MessageSquare size={15} />}
            disabled
            title={COPY.chatUnavailable}
            className={styles.heroBtn}
          >
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

      <section className={styles.block}>
        <h3 className={styles.blockTitle}>With your customer</h3>
        <div className={styles.links}>
          <Link
            to={`/organizer/invitation/${booking.id}`}
            className={styles.invitation}
          >
            <span className={styles.invitationIcon}>
              <Heart size={20} />
            </span>
            <span className={styles.invitationText}>
              <span className={styles.invitationTitle}>
                {COPY.invitationTitle}
              </span>
              <span className={styles.invitationSub}>{COPY.invitationSub}</span>
            </span>
            <ChevronRight size={18} className={styles.invitationChevron} />
          </Link>

          <IdeaSummary
            counts={ideaCounts}
            clientName={booking.customer?.name ?? 'Your client'}
            onOpen={onOpenIdeaBoard}
          />
        </div>
      </section>

      <section className={styles.block}>
        <div className={styles.blockHead}>
          <h3 className={styles.blockTitle}>Tasks</h3>
          {totalTasks > 0 && (
            <span className={styles.blockMeta}>
              {doneTasks} of {totalTasks} done
            </span>
          )}
        </div>

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
              inputMode="decimal"
              className={styles.addAmount}
              aria-label="Sub-vendor pay"
              placeholder="₹ pay"
              value={newTaskAmount}
              onChange={(e) => setNewTaskAmount(e.target.value)}
            />
          )}
          <Btn
            sm
            type="submit"
            icon={<Plus size={14} />}
            disabled={!newTaskTitle.trim() || isAddingTask}
            className={styles.addBtn}
          >
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
      </section>
    </div>
  );
}

export default Component;
