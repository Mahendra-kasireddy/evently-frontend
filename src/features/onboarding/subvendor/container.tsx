import { useSubvendorOnboarding } from './hooks';
import { Component } from './Component';

export function SubvendorOnboardingContainer() {
  const wizard = useSubvendorOnboarding();
  return <Component wizard={wizard} />;
}
