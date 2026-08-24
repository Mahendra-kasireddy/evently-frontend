import { useParams } from 'react-router-dom';
import { BookedWorkspaceContainer } from './container';

export function BookedWorkspacePage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  return <BookedWorkspaceContainer bookingId={bookingId ?? ''} />;
}
export default BookedWorkspacePage;
