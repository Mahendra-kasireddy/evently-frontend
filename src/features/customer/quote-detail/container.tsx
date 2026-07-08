import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { LoadingScreen, ErrorState, EmptyState } from '@shared/components';
import { useQuoteDetail } from './hooks';
import { Component } from './Component';

export function QuoteDetailContainer({ id }: { id: string }) {
  const navigate = useNavigate();
  const { data, rawStatus, isLoading, isError, refetch, accept, reject, isActing } =
    useQuoteDetail(id);

  if (isLoading) return <LoadingScreen message="Loading quote…" />;
  if (isError) {
    return (
      <ErrorState
        message="We couldn't load this quote. It may have been withdrawn, or your link is out of date."
        onRetry={refetch}
      />
    );
  }
  if (!data) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 20px' }}>
        <EmptyState
          icon={FileQuestion}
          title="Quote not found"
          message="This quotation isn’t available anymore."
          actionLabel="Back to quotes"
          onAction={() => navigate('/quotes')}
        />
      </div>
    );
  }

  return (
    <Component
      q={data}
      rawStatus={rawStatus}
      isActing={isActing}
      onAccept={accept}
      onReject={reject}
    />
  );
}
