import { LoadingScreen } from '@shared/components';
import { useQuotes } from './hooks';
import { Component } from './Component';

export function QuotesContainer() {
  const { data, isLoading } = useQuotes();
  if (isLoading || !data) return <LoadingScreen message="Loading quotes…" />;
  return <Component data={data} />;
}
