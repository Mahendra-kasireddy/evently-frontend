import { useParams } from 'react-router-dom';
import { ErrorState, LoadingScreen } from '@shared/components';
import { INVITATION_COPY as COPY } from './constants';
import { useInvitation } from './hooks';
import { Component } from './Component';

export function InvitationContainer() {
  const { bookingId = '' } = useParams<{ bookingId: string }>();
  const state = useInvitation(bookingId);

  if (state.isLoading) return <LoadingScreen message={COPY.loading} />;
  if (state.isError || !state.invitation) {
    return <ErrorState message={`${COPY.errorTitle}. ${COPY.errorBody}`} onRetry={state.refetch} />;
  }

  return <Component {...state} invitation={state.invitation} />;
}

export default InvitationContainer;
