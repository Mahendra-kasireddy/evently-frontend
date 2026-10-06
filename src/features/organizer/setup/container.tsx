import { useOnboarding } from '@features/onboarding/organizer/hooks';
import { Component } from './Component';

export function OrganizerSetupContainer() {
  const onb = useOnboarding();
  return <Component onb={onb} />;
}
