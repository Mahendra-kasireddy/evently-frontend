import { useParams } from 'react-router-dom';
import { InvitationContainer } from './container';

export function InvitationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  return <InvitationContainer bookingId={bookingId ?? ''} />;
}
export default InvitationPage;
