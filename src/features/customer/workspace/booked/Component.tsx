import {
  ChevronRight,
  Heart,
  Sparkles,
  ListChecks,
  History,
  MapPin,
  Calendar,
  UserCheck,
} from 'lucide-react';
import type { ApiBooking, ApiBookingTask } from '@features/customer/booking/types';
import { BackPill } from '../sections';
import { MY_EVENTS_ROUTE } from '../routes';
import type { CustomerInvitation } from '../invitation/service';
import type { IdeaCounts } from '../ideas/service';
import styles from './styles.module.css';

const RING = 104;
const STROKE = 9;
const RADIUS = (RING - STROKE - 2) / 2;
const CIRC = 2 * Math.PI * RADIUS;

const TASK_STATUS: Record<ApiBookingTask['status'], { label: string; cls: string }> = {
  todo: { label: 'Not started', cls: 'todo' },
  in_progress: { label: 'In progress', cls: 'progress' },
  done: { label: 'On track', cls: 'done' },
};

/** Assignment states worth surfacing — an accepted vendor needs no callout. */
const ASSIGNMENT_NOTE: Partial<Record<ApiBookingTask['assignmentStatus'], string>> = {
  pending: 'Awaiting vendor response',
  declined: 'Vendor declined — organizer is reassigning',
};

function dateLabel(iso?: string): string {
  if (!iso) return 'Date to be confirmed';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Date to be confirmed';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function timelineDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * Whole days, hours and minutes to the event — the reference's three countdown
 * chips. Derived from the stored event date, so it is only shown when there is
 * one; a chip row reading 0/0/0 for a booking with no date is noise.
 */
function countdown(iso?: string): { days: number; hrs: number; mins: number } | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const ms = t - Date.now();
  if (ms <= 0) return null;
  const mins = Math.floor(ms / 60000);
  return { days: Math.floor(mins / 1440), hrs: Math.floor((mins % 1440) / 60), mins: mins % 60 };
}

const pad = (n: number) => String(n).padStart(2, '0');

export interface BookedWorkspaceComponentProps {
  booking: ApiBooking;
  /** Absent until the organizer shares one — see the block below. */
  invitation?: CustomerInvitation | undefined;
  /** Real counts from the ideas board; zeros before anything is shared. */
  ideaCounts: IdeaCounts;
  onOpenIdeas: () => void;
  /** Opens the invitation screen; approving happens there, not here. */
  onOpenInvitation: () => void;
}

/**
 * The booked event's workspace, reached from the Home "Open workspace" card and
 * from My bookings — and living inside My Events, so the customer never leaves
 * the section while managing the event.
 *
 * Every block here is backed by real data: the countdown and ring from the
 * booking, the ideas summary from the ideas board's own counts, the invitation
 * block from the invitation module, and category progress from the organizer's
 * own task list. Family co-planning, the event-day schedule and the brief export
 * have no backend yet and are deliberately absent rather than mocked.
 */
export function Component({
  booking: b,
  invitation,
  ideaCounts,
  onOpenIdeas,
  onOpenInvitation,
}: BookedWorkspaceComponentProps) {
  const progress = Math.min(100, Math.max(0, b.progress ?? 0));
  const offset = CIRC * (1 - progress / 100);
  const cd = countdown(b.eventDate);
  const occasion = (b.occasion || 'event').toUpperCase();
  const tasks = b.tasks ?? [];
  const timeline = b.timeline ?? [];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <BackPill to={MY_EVENTS_ROUTE} label="My Events" />

        {/* ------------------------------------------------------- hero */}
        <section className={styles.hero}>
          <span className={styles.blob} aria-hidden />
          <span className={styles.blob2} aria-hidden />

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
            <span className={styles.ringText} aria-hidden="true">
              <strong>{progress}%</strong>
              <small>complete</small>
            </span>
          </div>

          <div className={styles.heroText}>
            <span className={styles.eyebrow}>YOUR {occasion} WORKSPACE</span>
            <h1 className={styles.heading}>
              {b.daysToGo > 0 ? `${b.daysToGo} ${b.daysToGo === 1 ? 'day' : 'days'} away` : 'Happening now'}
            </h1>
            <p className={styles.heroMeta}>
              {dateLabel(b.eventDate)}
              {b.location ? ` · ${b.location}` : ''}
            </p>
          </div>

          {cd && (
            <div className={styles.countdown}>
              {[
                { v: cd.days, l: 'Days' },
                { v: pad(cd.hrs), l: 'Hrs' },
                { v: pad(cd.mins), l: 'Min' },
              ].map((x) => (
                <div key={x.l} className={styles.chip}>
                  <strong>{x.v}</strong>
                  <small>{x.l}</small>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className={styles.grid}>
          <div className={styles.main}>
            {/* --------------------------------------------------- ideas */}
            <h2 className={styles.blockTitle}>Ideas &amp; planning board</h2>
            <section className={styles.ideas}>
              <span className={styles.ideasIcon}>
                <Sparkles size={22} />
              </span>
              <div className={styles.ideasText}>
                <strong>
                  {ideaCounts.shared === 0
                    ? `Share your ideas with ${b.organizer?.name ?? 'your organizer'}`
                    : `Your ideas with ${b.organizer?.name ?? 'your organizer'}`}
                </strong>
                <span>
                  {ideaCounts.shared === 0
                    ? 'Themes, must-haves, photos you love — they turn each one into a plan'
                    : `${ideaCounts.shared} ${ideaCounts.shared === 1 ? 'idea' : 'ideas'} shared · ${ideaCounts.planned} planned · ${ideaCounts.awaitingApproval} awaiting your approval`}
                </span>
              </div>
              <button type="button" className={styles.ideasCta} onClick={onOpenIdeas}>
                {ideaCounts.shared === 0 ? 'Start' : 'Open'} <ChevronRight size={15} />
              </button>
            </section>

            {/*
             * ------------------------------------------------- invitation
             *
             * Three states, all of them explicit — the block is never silently
             * absent:
             *
             *   not shared   the organizer is still drafting it (the API 404s
             *                that case), so this reads as a pending step
             *   sent         ready for the customer to review and sign off
             *   approved     signed off; the guest link is live
             *
             * Both live states open the invitation screen rather than acting
             * from here: approving is a decision made after reading the thing,
             * not a button pressed on a summary card.
             */}
            <h2 className={styles.blockTitle}>Guest invitation</h2>
            {!invitation ? (
              <p className={styles.emptyLine}>
                {b.organizer?.name ?? 'Your organizer'} is still preparing your guest invitation.
                You’ll be able to review and approve it here as soon as they share it.
              </p>
            ) : (
              <section className={styles.invite}>
                <span className={styles.inviteIcon}>
                  <Heart size={22} />
                </span>
                <div className={styles.inviteText}>
                  <strong>
                    {invitation.status === 'approved'
                      ? 'Your invitation is approved'
                      : 'Your invitation is ready to review'}
                  </strong>
                  <span>
                    {b.organizer?.name ?? 'Your organizer'} prepared it ·{' '}
                    {invitation.status === 'approved'
                      ? 'the guest link is live'
                      : 'awaiting your approval'}
                  </span>
                </div>
                <button
                  type="button"
                  className={
                    invitation.status === 'approved' ? styles.inviteGhost : styles.inviteCta
                  }
                  onClick={onOpenInvitation}
                >
                  {invitation.status === 'approved' ? 'View' : 'Review'} <ChevronRight size={15} />
                </button>
              </section>
            )}

            {/* ---------------------------------------- category progress */}
            <h2 className={styles.blockTitle}>
              <ListChecks size={17} /> Category progress
            </h2>
            {tasks.length === 0 ? (
              <p className={styles.emptyLine}>
                {b.organizer?.name ?? 'Your organizer'} hasn’t broken the event into tasks yet.
                They’ll appear here as vendors are assigned.
              </p>
            ) : (
              <div className={styles.cats}>
                {tasks.map((t) => {
                  const st = TASK_STATUS[t.status] ?? TASK_STATUS.todo;
                  const note = ASSIGNMENT_NOTE[t.assignmentStatus];
                  return (
                    <article key={t.id} className={styles.cat}>
                      <div className={styles.catHead}>
                        <span className={`${styles.dot} ${styles[st.cls] ?? ''}`} aria-hidden="true" />
                        <h3 className={styles.catTitle}>{t.title}</h3>
                        <span className={`${styles.catBadge} ${styles[st.cls] ?? ''}`}>{st.label}</span>
                      </div>
                      {t.assigneeName && (
                        <p className={styles.catVendor}>
                          Sub-vendor: <strong>{t.assigneeName}</strong>
                        </p>
                      )}
                      {note && <p className={styles.catNote}>{note}</p>}
                      {t.dueDate && (
                        <p className={styles.catNote}>Due {dateLabel(t.dueDate)}</p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* ------------------------------------------------------ rail */}
          <aside className={styles.rail}>
            <section className={styles.railCard}>
              <div className={styles.orgRow}>
                <span
                  className={styles.orgAvatar}
                  style={{ backgroundColor: b.organizer?.avatarColor ?? '#7c5bd6' }}
                  aria-hidden="true"
                >
                  {b.organizer?.initials ?? '★'}
                </span>
                <div className={styles.orgText}>
                  <strong>{b.organizer?.name ?? 'Your organizer'}</strong>
                  <span>Managing your event · you review &amp; approve</span>
                </div>
              </div>
            </section>

            <section className={styles.railCard}>
              <h3 className={styles.railTitle}>
                <UserCheck size={16} /> Booking
              </h3>
              <ul className={styles.factList}>
                <li>
                  <Calendar size={14} /> <span>{dateLabel(b.eventDate)}</span>
                </li>
                {b.location && (
                  <li>
                    <MapPin size={14} /> <span>{b.location}</span>
                  </li>
                )}
                <li className={styles.ref}>{b.ref}</li>
              </ul>
            </section>

            {timeline.length > 0 && (
              <section className={styles.railCard}>
                {/* The booking's own status history. Deliberately *not* labelled
                    "event-day timeline" — that schedule does not exist yet. */}
                <h3 className={styles.railTitle}>
                  <History size={16} /> Booking timeline
                </h3>
                <ol className={styles.timeline}>
                  {timeline.map((e, i) => (
                    <li key={`${e.status}-${i}`} className={i === timeline.length - 1 ? styles.tNow : ''}>
                      <span className={styles.tDot} aria-hidden="true" />
                      <div>
                        <strong>{e.label}</strong>
                        {timelineDate(e.at) && <small>{timelineDate(e.at)}</small>}
                        {e.note && <p>{e.note}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
