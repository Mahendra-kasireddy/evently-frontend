import { LoadingScreen, ErrorState } from '@shared/components';
import { useSubvendors } from './hooks';
import { Component } from './Component';

export function SubvendorsContainer() {
  const { active, pending, isLoading, isError, refetch, phone, setPhone, invite, isInviting, inviteError, remove } =
    useSubvendors();

  if (isLoading) return <LoadingScreen message="Loading your sub-vendors…" />;
  if (isError) {
    return (
      <ErrorState
        message="We couldn't load your sub-vendors. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <Component
      active={active}
      pending={pending}
      phone={phone}
      setPhone={setPhone}
      onInvite={() => void invite()}
      isInviting={isInviting}
      inviteError={inviteError}
      onRemove={remove}
    />
  );
}
