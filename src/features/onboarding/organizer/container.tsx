import { useOnboarding } from './hooks';
import { Component } from './Component';

export function OrganizerOnboardingContainer() {
  const onb = useOnboarding();
  return (
    <Component
      steps={onb.steps}
      currentId={onb.currentId}
      goToStep={onb.goToStep}
      submitBasicInfo={onb.submitBasicInfo}
      isSaving={onb.isSaving}
      fieldErrors={onb.fieldErrors}
      error={onb.error}
    />
  );
}
