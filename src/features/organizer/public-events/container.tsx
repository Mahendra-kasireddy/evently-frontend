import { ErrorState, LoadingScreen } from '@shared/components';
import { usePublicEvents } from './hooks';
import { describeLoadError, looksLikeMissingRoute } from './loadError';
import { Component } from './Component';

export function PublicEventsContainer() {
  const {
    events,
    filter,
    setFilter,
    search,
    setSearch,
    isLoading,
    isFetching,
    isError,
    loadError,
    refetch,
    create,
    isCreating,
    createError,
  } = usePublicEvents();

  if (isLoading) return <LoadingScreen message="Loading your public events…" />;

  if (isError) {
    /*
     * The server's own sentence, not a stock one. "Check your connection" sent
     * to somebody whose account simply has no organizer profile — or whose API
     * has not been restarted since this feature was added — is a wrong answer
     * that costs an afternoon.
     */
    const failure = describeLoadError(loadError, 'your public events');
    const message = looksLikeMissingRoute(loadError)
      ? 'This API does not have the public events endpoints yet. If the backend was just updated, restart it and try again.'
      : failure.message;

    return <ErrorState message={message} {...(failure.retryable ? { onRetry: refetch } : {})} />;
  }

  return (
    <Component
      events={events}
      filter={filter}
      onFilter={setFilter}
      search={search}
      onSearch={setSearch}
      isFetching={isFetching}
      isCreating={isCreating}
      createError={createError}
      onCreate={create}
    />
  );
}

export default PublicEventsContainer;
