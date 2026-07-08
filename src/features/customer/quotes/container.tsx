import { useNavigate } from 'react-router-dom';
import { MessageSquareQuote } from 'lucide-react';
import { LoadingScreen, ErrorState, EmptyState } from '@shared/components';
import { useQuotes } from './hooks';
import { Component } from './Component';

export function QuotesContainer() {
  const navigate = useNavigate();
  const { requests, detail, isLoading, isError, refetch, cancel, isActing } = useQuotes();

  if (isLoading) return <LoadingScreen message="Loading quotes…" />;
  if (isError) {
    return (
      <ErrorState
        message="We couldn't load your quotes. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }
  if (requests.length === 0 || !detail) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 20px' }}>
        <EmptyState
          icon={MessageSquareQuote}
          title="No quote requests yet"
          message="Plan an event and request quotes from verified organizers — they’ll appear here to compare side by side."
          actionLabel="Plan an event"
          onAction={() => navigate('/plan')}
        />
      </div>
    );
  }

  return <Component detail={detail} isActing={isActing} onCancel={(id) => cancel(id)} />;
}
