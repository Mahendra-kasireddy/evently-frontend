import { useEffect } from 'react';
import { LoadingScreen, ErrorState } from '@shared/components';
import { useAppDispatch } from '@app/hooks';
import { useCustomerHome } from './hooks';
import { setDraft } from './service';
import { Component } from './Component';

/**
 * Orchestration: runs the home hook and seeds the editable hero draft from the
 * backend content. Renders loading, error (with retry) and content states.
 */
export function CustomerHomeContainer() {
  const { data, isLoading, isError, refetch } = useCustomerHome();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data) dispatch(setDraft(data.hero.draft));
  }, [data, dispatch]);

  if (isError && !data) {
    return (
      <ErrorState
        message="We couldn't load your home page. Please check your connection and try again."
        onRetry={() => void refetch()}
      />
    );
  }
  if (isLoading || !data) return <LoadingScreen message="Loading your celebrations…" />;
  return <Component data={data} />;
}
