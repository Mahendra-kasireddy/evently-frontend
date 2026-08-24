import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { bookingStatusLabel, dateLabel, formatINR } from '@features/organizer/bookings/transform';
import type { ApiBooking } from '../../types';
import styles from './EventCard.module.css';

export interface EventCardProps {
  booking: ApiBooking;
}

export function EventCard({ booking }: EventCardProps) {
  const navigate = useNavigate();
  const doneTasks = booking.tasks.filter((t) => t.status === 'done').length;

  return (
    <button type="button" className={styles.card} onClick={() => navigate(`/organizer/events/${booking.id}`)}>
      <div className={styles.head}>
        <div className={styles.who}>
          <strong className={styles.title}>{booking.title || booking.occasion || 'Event'}</strong>
          <small className={styles.meta}>
            {[dateLabel(booking.eventDate), booking.location].filter(Boolean).join(' · ')}
          </small>
        </div>
        <span className={styles.status}>{bookingStatusLabel(booking.status)}</span>
      </div>

      <div className={styles.foot}>
        <span className={styles.days}>{booking.daysToGo} days to go</span>
        {booking.tasks.length > 0 && (
          <span className={styles.tasks}>{doneTasks}/{booking.tasks.length} tasks done</span>
        )}
        <span className={styles.amount}>{formatINR(booking.amount)}</span>
      </div>

      <span className={styles.detail}>
        Open execution board <ChevronRight size={13} />
      </span>
    </button>
  );
}

export default EventCard;
