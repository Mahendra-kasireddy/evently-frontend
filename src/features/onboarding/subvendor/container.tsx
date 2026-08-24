import { useAuth } from '@app/auth';
import { useSubvendorOnboarding } from './hooks';
import { Component } from './Component';
import { AuthGate } from './sections/AuthGate/AuthGate';

function OnboardingInner() {
  const wizard = useSubvendorOnboarding();
  return <Component wizard={wizard} />;
}

/** Sub-vendor onboarding is OTP-first, same as organizer onboarding. */
export function SubvendorOnboardingContainer() {
  const { status } = useAuth();

  if (status !== 'authenticated') {
    return <AuthGate />;
  }
  return <OnboardingInner />;
}
