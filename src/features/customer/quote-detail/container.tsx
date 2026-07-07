import { LoadingScreen } from '@shared/components';
import { useQuoteDetail } from './hooks';
import { Component } from './Component';

export function QuoteDetailContainer({ id }: { id: string }) {
  const { data, isLoading } = useQuoteDetail(id);
  if (isLoading || !data) return <LoadingScreen message="Loading quote…" />;
  return <Component q={data} />;
}
