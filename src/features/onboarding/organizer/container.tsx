import { Navigate } from 'react-router-dom';
import { useAuth } from '@app/auth';
import { useOnboarding } from './hooks';
import { Component } from './Component';
import { AuthGate } from './sections/AuthGate/AuthGate';

/** Inner view — only mounted once we know the user is authenticated. */
function OnboardingInner() {
  const onb = useOnboarding();

  /*
   * An organizer who has already submitted their profile does not belong in the
   * wizard. "Log in as Organizer" points at this route, so without this they
   * land back on onboarding on every sign-in and have to click through to reach
   * their dashboard. The exception is a submission made in this session, which
   * shows the confirmation panel first.
   */
  if (onb.submitted && !onb.justSubmitted) {
    return <Navigate to="/organizer/home" replace />;
  }

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
