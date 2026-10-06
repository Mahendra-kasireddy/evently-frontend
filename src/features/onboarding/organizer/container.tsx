import { Navigate } from 'react-router-dom';
import { useAuth } from '@app/auth';
import { AuthGate } from './sections/AuthGate/AuthGate';
import { SignupForm } from './sections/SignupForm/SignupForm';

/**
 * Organizer sign-up (/onboarding/organizer): verify the mobile, give five
 * basic details, land on the dashboard.
 *
 * OTP-first, inline: an unauthenticated visitor verifies here rather than
 * being bounced to /login, so "Register your business" always lands somewhere
 * useful. An account that is already an organizer has nothing to sign up for
 * and goes to its dashboard, where the go-live checklist lives.
 */
export function OrganizerOnboardingContainer() {
  const { status, roles } = useAuth();

  if (status !== 'authenticated') return <AuthGate />;
  if (roles.includes('organizer')) return <Navigate to="/organizer/home" replace />;
  return <SignupForm />;
}
