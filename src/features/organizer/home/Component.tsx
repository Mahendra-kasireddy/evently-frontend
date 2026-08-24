import { Link } from 'react-router-dom';
import { Calendar, Check, ChevronRight, MessageSquare, Star, Wallet } from 'lucide-react';
import {
  Avatar,
  BtnLink,
  Card,
  PageStack,
  Stat,
  StatRow,
  Tier,
  formatInr,
  relativeTime,
} from '@shared/partner';
import { weekdayLabel } from '@features/organizer/bookings/transform';
import type { ApiIncomingRequest } from '@features/organizer/quotes/types';
import { HOME_COPY } from './constants';
import type { BadgeStatus, DashboardScheduleItem, DashboardTask, OrganizerDashboard } from './types';
import styles from './styles.module.css';

export interface OrganizerHomeComponentProps {
  summary: OrganizerDashboard;
  onToggleTask: (bookingId: string, taskId: string, done: boolean) => void;
  badges?: BadgeStatus | undefined;
}

/**
 * `Priya R. · Wedding`. The API shortens the name for privacy and leaves it
 * empty when the customer has none on file, so fall back to the request's own
 * details in that case.
 */
const enquiryLabel = (r: ApiIncomingRequest): string =>
  r.customerName
    ? `${r.customerName} · ${r.occasion || 'Event'}`
    : [r.occasion || 'Event', r.where].filter(Boolean).join(' · ');
const enquirySeed = (r: ApiIncomingRequest): string =>
  r.customerName || [r.occasion || 'Event', r.where].filter(Boolean).join(' ');

const categoriesLabel = (count: number): string => `${count} ${count === 1 ? 'category' : 'categories'}`;

/** `Today` for today's events, otherwise the short weekday (`Sat`). */
function dayLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10) ? 'Today' : weekdayLabel(iso);
}

const DOT_TONES = [styles.dotNavy, styles.dotTeal, styles.dotAmber] as const;

function TaskRow({
  task,
  onToggle,
}: {
  task: DashboardTask;
  onToggle: (bookingId: string, taskId: string, done: boolean) => void;
}) {
  const done = task.status === 'done';
  return (
    <li className={styles.taskRow}>
      <button
        type="button"
        className={`${styles.checkbox} ${done ? styles.checkboxOn : ''}`}
        onClick={() => onToggle(task.bookingId, task.id, !done)}
        aria-label={done ? 'Mark as not done' : 'Mark as done'}
      >
        {done && <Check size={12} strokeWidth={3} />}
      </button>
      <span className={`${styles.taskLabel} ${done ? styles.taskDone : ''}`}>{task.title}</span>
    </li>
  );
}

function ScheduleRow({ item, index }: { item: DashboardScheduleItem; index: number }) {
  return (
    <li className={styles.schedRow}>
      <span className={styles.schedDay}>{dayLabel(item.eventDate)}</span>
      <span className={`${styles.dot} ${DOT_TONES[index % DOT_TONES.length] ?? ''}`} aria-hidden />
      <span className={styles.schedTitle}>{item.title}</span>
    </li>
  );
}

/** Silver → Gold (etc.) progress, matching the design's "Badge progress" card. */
function BadgeProgressPanel({ badges }: { badges: BadgeStatus }) {
  const { currentTier, nextTier, nextRequirements, events } = badges;

  if (!nextTier || !nextRequirements) {
    return (
      <Card padding="20px">
        <h2 className={styles.railTitle}>{HOME_COPY.badgeTitle}</h2>
        <div className={styles.tierRow}>
          <Tier tier={currentTier} />
        </div>
        <p className={styles.tierNote}>You&rsquo;ve reached the top tier.</p>
      </Card>
    );
  }

  const remaining = Math.max(0, nextRequirements.events - events);
  const percent = Math.min(100, Math.round((events / Math.max(1, nextRequirements.events)) * 100));

  return (
    <Card padding="20px">
      <h2 className={styles.railTitle}>{HOME_COPY.badgeTitle}</h2>
      <div className={styles.tierRow}>
        <Tier tier={currentTier} />
        <ChevronRight size={16} />
        <Tier tier={nextTier} />
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
      <p className={styles.tierNote}>
        {remaining > 0 ? (
          <>
            {remaining} more events to reach <strong>{nextTier} tier</strong>
          </>
        ) : (
          <>
            Ready for <strong>{nextTier} tier</strong>
          </>
        )}
      </p>
    </Card>
  );
}

/** Presentational organizer home. Pure: data in via props. */
export function Component({ summary, onToggleTask, badges }: OrganizerHomeComponentProps) {
  // The design lists what's still open first; the API returns tasks in its own order.
  const tasks = [...summary.todaysTasks].sort(
    (a, b) => Number(a.status === 'done') - Number(b.status === 'done'),
  );

  return (
    <PageStack>
      <StatRow>
        <Link to="/organizer/quotes" className={styles.statLink}>
          <Stat
            label={HOME_COPY.statsEnquiries}
            value={summary.newEnquiries}
            icon={<MessageSquare size={16} />}
            tone="coral"
          />
        </Link>
        <Link to="/organizer/events" className={styles.statLink}>
          <Stat
            label={HOME_COPY.statsActive}
            value={summary.activeBookings}
            icon={<Calendar size={16} />}
            tone="navy"
          />
        </Link>
        <Stat
          label={HOME_COPY.statsMonth}
          value={formatInr(summary.monthEarnings)}
          icon={<Wallet size={16} />}
          tone="teal"
          delta={summary.monthEarningsChangePercent}
        />
        <Stat
          label={HOME_COPY.statsRating}
          value={summary.avgRating ? `${summary.avgRating.toFixed(1)}★` : '—'}
          icon={<Star size={16} />}
          tone="amber"
        />
      </StatRow>

      <div className={styles.row}>
        <div className={styles.main}>
          <Card className={styles.tasksCard} padding="20px">
            <h2 className={styles.cardTitle}>{HOME_COPY.tasksTitle}</h2>
            {tasks.length ? (
              <ul className={styles.taskList}>
                {tasks.map((t) => (
                  <TaskRow key={t.id} task={t} onToggle={onToggleTask} />
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>{HOME_COPY.tasksEmpty}</p>
            )}
          </Card>
        </div>

        <aside className={styles.rail}>
          {badges && <BadgeProgressPanel badges={badges} />}

          <Card padding="20px">
            <h2 className={`${styles.railTitle} ${styles.railTitleWide}`}>{HOME_COPY.scheduleTitle}</h2>
            {summary.next7Days.length ? (
              <ul className={styles.schedList}>
                {summary.next7Days.map((item, i) => (
                  <ScheduleRow key={item.id} item={item} index={i} />
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>{HOME_COPY.scheduleEmpty}</p>
            )}
          </Card>
        </aside>
      </div>

      <Card padding="18px 20px">
        <div className={styles.enqHead}>
          <h2 className={styles.enqTitle}>{HOME_COPY.enquiriesTitle}</h2>
          <Link to="/organizer/quotes" className={styles.viewAll}>
            {HOME_COPY.enquiriesViewAll}
          </Link>
        </div>
        {summary.pendingEnquiries.length ? (
          <ul className={styles.enqList}>
            {summary.pendingEnquiries.map((r) => (
              <li key={r.id} className={styles.enqRow}>
                <Avatar name={enquirySeed(r)} size={38} />
                <div className={styles.enqWho}>
                  <div className={styles.enqName}>{enquiryLabel(r)}</div>
                  <div className={styles.enqMeta}>
                    {[r.when, categoriesLabel(r.categories.length)].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className={styles.enqTime}>{relativeTime(r.createdAt)}</div>
                <BtnLink to={`/organizer/respond/${r.id}`} sm>
                  {HOME_COPY.enquiriesCta}
                </BtnLink>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>{HOME_COPY.enquiriesEmpty}</p>
        )}
      </Card>
    </PageStack>
  );
}
