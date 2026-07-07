import { useParams } from 'react-router-dom';
import { OrganizerProfileContainer } from './container';

export function OrganizerProfilePage() {
  const { id } = useParams<{ id: string }>();
  return <OrganizerProfileContainer id={id ?? 'sharma'} />;
}

export default OrganizerProfilePage;
