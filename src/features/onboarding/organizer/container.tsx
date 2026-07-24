import { useAuth } from '@app/auth';
import { useOnboarding } from './hooks';
import { Component } from './Component';
import { AuthGate } from './sections/AuthGate/AuthGate';

/** Inner view — only mounted once we know the user is authenticated. */
function OnboardingInner() {
  const onb = useOnboarding();
  return <Component onb={onb} />;
}

/**
 * Organizer onboarding is OTP-first: the user must verify their mobile (via the
 * existing OTP auth) before registering as an organizer. Rather than bouncing
 * unauthenticated visitors to /login, we show the verification inline so the
 * "Log in as Organizer" entry point always lands somewhere useful.
 */
export function OrganizerOnboardingContainer() {
  const { status } = useAuth();

  if (status !== 'authenticated') {
    return <AuthGate />;
  }
  return <OnboardingInner />;
}
