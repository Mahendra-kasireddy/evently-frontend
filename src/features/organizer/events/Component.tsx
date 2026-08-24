import { EventCard } from './sections';
import { EVENTS_COPY } from './constants';
import type { ApiBooking } from './types';
import styles from './styles.module.css';

export interface EventsComponentProps {
  bookings: ApiBooking[];
}

export function Component({ bookings }: EventsComponentProps) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.heading}>{EVENTS_COPY.title}</h1>
          <p className={styles.subtitle}>
            {bookings.length > 0 ? EVENTS_COPY.subtitleActive(bookings.length) : EVENTS_COPY.subtitleEmpty}
          </p>
        </header>

        <div className={styles.list}>
          {bookings.map((b) => (
            <EventCard key={b.id} booking={b} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default Component;
