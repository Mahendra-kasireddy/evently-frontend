import { ErrorState, LoadingScreen } from '@shared/components';
import { useCoupons } from './hooks';
import { Component } from './Component';

export function CouponsContainer() {
  const {
    coupons,
    usage,
    isLoading,
    isError,
    refetch,
    create,
    isCreating,
    createError,
    clearCreateError,
    setStatus,
  } = useCoupons();

  if (isLoading) return <LoadingScreen message="Loading your coupons…" />;
  if (isError) {
    return (
      <ErrorState
        message="We couldn't load your coupons. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <Component
      coupons={coupons}
      usage={usage}
      isCreating={isCreating}
      createError={createError}
      onCreate={create}
      onClearError={clearCreateError}
      onSetStatus={setStatus}
    />
  );
}
