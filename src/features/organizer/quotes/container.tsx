import { Inbox, SearchX } from 'lucide-react';
import { LoadingScreen, ErrorState } from '@shared/components';
import { EmptyBox } from '@shared/partner';
import { useIncomingQuotes } from './hooks';
import { Component } from './Component';
import styles from './styles.module.css';

export function OrganizerQuotesContainer() {
  const { requests, totalCount, searchTerm, isLoading, isError, refetch } = useIncomingQuotes();

  if (isLoading) return <LoadingScreen message="Loading your requests…" />;
  if (isError) {
    return (
      <ErrorState
        message="We couldn't load your incoming requests. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }
  if (requests.length === 0 && searchTerm) {
    return (
      <EmptyBox
        icon={<SearchX size={24} className={styles.emptyIcon} />}
        title="No matching requests"
        body={`Nothing matches "${searchTerm}" in your ${totalCount} request${totalCount === 1 ? '' : 's'}.`}
      />
    );
  }
  if (requests.length === 0) {
    return (
      <EmptyBox
        icon={<Inbox size={24} className={styles.emptyIcon} />}
        title="No requests yet"
        body="When a customer requests a quote from you, it'll show up here."
      />
    );
  }

  return <Component requests={requests} />;
}
