import { EventCard } from './sections';
import { EVENTS_COPY } from './constants';
import type { ApiBooking } from './types';
import styles from './styles.module.css';

export interface EventsComponentProps {
  bookings: ApiBooking[];
  /** Paid bookings still waiting on this organizer to accept or decline. */
  awaiting: ApiBooking[];
}

export function Component({ bookings, awaiting }: EventsComponentProps) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {awaiting.length > 0 && (
          <section className={styles.section}>
            <header className={styles.header}>
              <h1 className={`${styles.heading} ${styles.urgent}`}>
                {EVENTS_COPY.awaitingTitle}
                <span className={styles.count}>{awaiting.length}</span>
              </h1>
              <p className={styles.subtitle}>{EVENTS_COPY.awaitingSubtitle(awaiting.length)}</p>
            </header>
            <div className={styles.list}>
              {awaiting.map((b) => (
                <EventCard key={b.id} booking={b} />
              ))}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <header className={styles.header}>
            <h1 className={styles.heading}>{EVENTS_COPY.title}</h1>
            <p className={styles.subtitle}>
              {bookings.length > 0
                ? EVENTS_COPY.subtitleActive(bookings.length)
                : EVENTS_COPY.subtitleEmpty}
            </p>
          </header>

          <div className={styles.list}>
            {bookings.map((b) => (
              <EventCard key={b.id} booking={b} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Component;
