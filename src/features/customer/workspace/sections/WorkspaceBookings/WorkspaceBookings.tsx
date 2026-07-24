import { CalendarCheck } from 'lucide-react';
import { formatINR } from '@features/customer/quotes/transform';
import type { ApiBooking, BookingStatus } from '@features/customer/booking/types';
import styles from './WorkspaceBookings.module.css';

const STATUS: Record<BookingStatus, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'pending' },
  confirmed: { label: 'Confirmed', cls: 'confirmed' },
  in_progress: { label: 'In progress', cls: 'progress' },
  completed: { label: 'Completed', cls: 'completed' },
  cancelled: { label: 'Cancelled', cls: 'cancelled' },
  rejected: { label: 'Rejected', cls: 'rejected' },
};

export interface WorkspaceBookingsProps {
  bookings: ApiBooking[];
  onOpen: (id: string) => void;
}

export function WorkspaceBookings({ bookings, onOpen }: WorkspaceBookingsProps) {
  if (bookings.length === 0) return null;
  return (
    <section className={styles.block}>
      <h3 className={styles.head}><CalendarCheck size={17} /> My bookings</h3>
      <div className={styles.list}>
        {bookings.map((b) => {
          const s = STATUS[b.status] ?? { label: b.status || 'Unknown', cls: 'pending' };
          return (
            <button key={b.id} type="button" className={styles.card} onClick={() => onOpen(b.id)}>
              <span className={styles.avatar} style={{ backgroundColor: b.organizer?.avatarColor ?? '#7c5bd6' }}>
                {b.organizer?.initials ?? '★'}
              </span>
              <div className={styles.body}>
                <span className={styles.title}>{b.title}</span>
                <span className={styles.meta}>{b.ref} · {b.organizer?.name ?? 'Organizer'}</span>
              </div>
              <div className={styles.right}>
                <span className={styles.amount}>{formatINR(b.amount)}</span>
                <span className={`${styles.badge} ${styles[s.cls]}`}>{s.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
