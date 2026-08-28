import { useNavigate } from 'react-router-dom';
import { LoadingScreen, ErrorState } from '@shared/components';
import { useSubvendorSettings } from './hooks';
import { Component } from './Component';

export function SubvendorSettingsContainer() {
  const navigate = useNavigate();
  const s = useSubvendorSettings();

  if (s.isLoading) return <LoadingScreen message="Loading your settings…" />;
  if (s.isError || !s.account) {
    return (
      <ErrorState
        message="We couldn't load your settings. Please check your connection and try again."
        onRetry={s.refetch}
      />
    );
  }

  return (
    <Component
      account={s.account}
      profile={s.profile}
      editing={s.editing}
      edits={s.edits}
      errors={s.errors}
      saved={s.saved}
      saveError={s.saveError}
      isSaving={s.isSaving}
      onStartEditing={s.startEditing}
      onCancelEditing={s.cancelEditing}
      onEdit={s.setEdit}
      onSave={s.save}
      onAvailability={s.setAvailability}
      onSignOut={() => {
        s.signOut();
        navigate('/login');
      }}
    />
  );
}
