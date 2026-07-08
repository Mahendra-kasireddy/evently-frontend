import { useParams } from 'react-router-dom';
import { BookingContainer } from './container';

export function BookingPage() {
  const { quotationId } = useParams<{ quotationId: string }>();
  return <BookingContainer quotationId={quotationId ?? ''} />;
}
export default BookingPage;
