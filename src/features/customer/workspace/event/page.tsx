import { useParams } from 'react-router-dom';
import { WorkspaceEventContainer } from './container';

export function WorkspaceEventPage() {
  const { requestId } = useParams<{ requestId: string }>();
  return <WorkspaceEventContainer requestId={requestId ?? ''} />;
}
export default WorkspaceEventPage;
