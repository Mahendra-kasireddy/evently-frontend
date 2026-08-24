import { useParams } from 'react-router-dom';
import { OrganizerIdeasContainer } from './container';

export function OrganizerIdeasPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  return <OrganizerIdeasContainer bookingId={bookingId ?? ''} />;
}
export default OrganizerIdeasPage;
