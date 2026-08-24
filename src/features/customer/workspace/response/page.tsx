import { useParams } from 'react-router-dom';
import { WorkspaceResponseContainer } from './container';

export function WorkspaceResponsePage() {
  const { requestId, quotationId } = useParams<{ requestId: string; quotationId: string }>();
  return (
    <WorkspaceResponseContainer requestId={requestId ?? ''} quotationId={quotationId ?? ''} />
  );
}
export default WorkspaceResponsePage;
