import { useParams } from 'react-router-dom';
import { IdeasContainer } from './container';

export function IdeasPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  return <IdeasContainer bookingId={bookingId ?? ''} />;
}
export default IdeasPage;
