import { LoadingScreen, ErrorState } from '@shared/components';
import { useSubvendorHome } from './hooks';
import { Component } from './Component';

export function SubvendorHomeContainer() {
  const home = useSubvendorHome();

  if (home.isLoading) return <LoadingScreen message="Loading your tasks…" />;
  if (home.isError) {
    return (
      <ErrorState
        message="We couldn't load your tasks. Please check your connection and try again."
        onRetry={home.refetch}
      />
    );
  }

  return (
    <Component
      pending={home.pending}
      active={home.active}
      done={home.done}
      doneTotal={home.doneTotal}
      completedCount={home.completedCount}
      earnedThisMonth={home.earnedThisMonth}
      respond={home.respond}
      isResponding={home.isResponding}
      respondError={home.respondError}
    />
  );
}
