import { useParams } from 'react-router-dom';
import { MemoriesContainer } from './container';

/** My Events → a booked event → its shared memories. */
export function MemoriesPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  return <MemoriesContainer bookingId={bookingId ?? ''} />;
}

export default MemoriesPage;
