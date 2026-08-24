import { useParams } from 'react-router-dom';
import { EventDetailContainer } from './container';

export function EventDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  if (!bookingId) return null;
  return <EventDetailContainer bookingId={bookingId} />;
}

export default EventDetailPage;
