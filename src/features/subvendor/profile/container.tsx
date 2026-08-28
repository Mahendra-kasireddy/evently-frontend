import { LoadingScreen, ErrorState } from '@shared/components';
import { useSubvendorProfile } from './hooks';
import { Component } from './Component';

export function SubvendorProfileContainer() {
  const p = useSubvendorProfile();

  if (p.isLoading) return <LoadingScreen message="Loading your profile…" />;
  if (p.isError || !p.profile) {
    return (
      <ErrorState
        message="We couldn't load your profile. Please check your connection and try again."
        onRetry={p.refetch}
      />
    );
  }

  return (
    <Component
      profile={p.profile}
      organizers={p.organizers}
      editing={p.editing}
      edits={p.edits}
      errors={p.errors}
      saved={p.saved}
      saveError={p.saveError}
      isSaving={p.isSaving}
      onStartEditing={p.startEditing}
      onCancelEditing={p.cancelEditing}
      onEdit={p.setEdit}
      onSave={p.save}
      onAvailability={p.setAvailability}
    />
  );
}
