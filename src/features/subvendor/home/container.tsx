import { LoadingScreen, ErrorState } from '@shared/components';
import { useSubvendorHome } from './hooks';
import { Component } from './Component';

export function SubvendorHomeContainer() {
  const { isLoading, isError, refetch, pending, active, completedCount, earnedThisMonth, respond, isResponding } =
    useSubvendorHome();

  if (isLoading) return <LoadingScreen message="Loading your tasks…" />;
  if (isError) {
    return (
      <ErrorState message="We couldn't load your tasks. Please check your connection and try again." onRetry={refetch} />
    );
  }

  return (
    <Component
      pending={pending}
      active={active}
      completedCount={completedCount}
      earnedThisMonth={earnedThisMonth}
      respond={respond}
      isResponding={isResponding}
    />
  );
}
