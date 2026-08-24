import { ErrorState, LoadingScreen } from '@shared/components';
import { useQuoteBuilderQueue } from './hooks';
import { Component } from './Component';

export function QuoteBuilderContainer() {
  const { isLoading, isError, refetch, filter, setFilter, counts, visible, sentValue, hasAny } =
    useQuoteBuilderQueue();

  if (isLoading) return <LoadingScreen message="Loading your quoting queue…" />;
  if (isError) {
    return (
      <ErrorState
        message="We couldn't load your quoting queue. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <Component
      filter={filter}
      onFilterChange={setFilter}
      counts={counts}
      visible={visible}
      sentValue={sentValue}
      hasAny={hasAny}
    />
  );
}

export default QuoteBuilderContainer;
