import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Inbox } from 'lucide-react';
import { EmptyState } from '@shared/components';
import { EventCard } from './sections';
import { tabFor, type EventTab, type WorkspaceEvent } from './event-model';
import styles from './styles.module.css';

export interface WorkspaceComponentProps {
  events: WorkspaceEvent[];
}

const TABS: Array<{ id: EventTab; label: string; empty: string }> = [
  {
    id: 'needs-you',
    label: 'Needs you',
    empty: 'Nothing is waiting on you right now.',
  },
  {
    id: 'upcoming',
    label: 'Upcoming',
    empty: 'No events in progress. Plan one to get started.',
  },
  {
    id: 'past',
    label: 'Past',
    empty: 'Finished and cancelled events will appear here.',
  },
];

/**
 * My Events — one list, one card per event.
 *
 * This screen used to stack four sections (bookings, organizer responses, draft
 * plans, submitted plans) that each held a different record of the *same*
 * events, so one celebration appeared up to three times under two names. Now a
 * plan, its quote request and its booking are folded into a single card that
 * carries the event from draft to delivered, and the only division is by whose
 * move it is:
 *
 *   Needs you  — a draft to finish, quotes to compare, an invitation to approve
 *   Upcoming   — live, but waiting on an organizer
 *   Past       — delivered, cancelled or expired
 */
export function Component({ events }: WorkspaceComponentProps) {
  const navigate = useNavigate();

  const grouped = useMemo(() => {
    const map: Record<EventTab, WorkspaceEvent[]> = {
      'needs-you': [],
      upcoming: [],
      past: [],
    };
    for (const e of events) map[tabFor(e)].push(e);
    return map;
  }, [events]);

  // Open on whichever tab has something to act on — the customer came here to
  // find out what they owe, and landing on an empty tab hides that.
  const [tab, setTab] = useState<EventTab>(() =>
    grouped['needs-you'].length > 0 ? 'needs-you' : 'upcoming',
  );

  const active = TABS.find((t) => t.id === tab) ?? TABS[1]!;
  const shown = grouped[tab];

  if (events.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <Header onStartPlan={() => navigate('/plan')} />
          <EmptyState
            icon={CalendarPlus}
            title="No events yet"
            message="Start planning your first celebration — tell us the occasion and get tailored quotes from verified organizers within a day."
            actionLabel="Plan an event"
            onAction={() => navigate('/plan')}
          />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Header onStartPlan={() => navigate('/plan')} />

        <div className={styles.tabs} role="tablist" aria-label="Filter events">
          {TABS.map((t) => {
            const count = grouped[t.id].length;
            const selected = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`${styles.tab} ${selected ? styles.tabActive : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                <span
                  className={`${styles.tabCount} ${
                    t.id === 'needs-you' && count > 0 ? styles.tabCountAlert : ''
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {shown.length === 0 ? (
          <p className={styles.emptyLine}>
            <Inbox size={16} /> {active.empty}
          </p>
        ) : (
          <div className={styles.list}>
            {shown.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Header({ onStartPlan }: { onStartPlan: () => void }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerText}>
        <h1 className={styles.heading}>My Events</h1>
        <p className={styles.sub}>Every event you're planning, from first draft to event day.</p>
      </div>
      <button type="button" className={styles.cta} onClick={onStartPlan}>
        <CalendarPlus size={16} /> Plan a new event
      </button>
    </header>
  );
}
