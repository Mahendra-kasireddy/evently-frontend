import { useParams } from 'react-router-dom';
import { BookingDetailContainer } from './container';

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <BookingDetailContainer id={id ?? ''} />;
}
export default BookingDetailPage;
