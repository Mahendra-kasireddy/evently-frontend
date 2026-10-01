import { useParams } from 'react-router-dom';
import { ErrorState, LoadingScreen } from '@shared/components';
import { usePublicEventWorkspace } from './hooks';
import { describeLoadError } from './loadError';
import { EventWorkspace } from './EventWorkspace';

export function PublicEventWorkspaceContainer() {
  const { eventId = '' } = useParams<{ eventId: string }>();
  const ws = usePublicEventWorkspace(eventId);

  if (ws.isLoading) return <LoadingScreen message="Opening your event…" />;

  if (ws.isError || !ws.event) {
    const failure = describeLoadError(ws.loadError, 'that event');
    return <ErrorState message={failure.message} {...(failure.retryable ? { onRetry: ws.refetch } : {})} />;
  }

  return <EventWorkspace event={ws.event} ws={ws} />;
}

export default PublicEventWorkspaceContainer;
