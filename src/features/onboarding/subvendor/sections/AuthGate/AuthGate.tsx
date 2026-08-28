import { OnboardingGate, type GateCopy } from '../../../shared/OnboardingGate';
import { SUBVENDOR_GATE } from '../../constants';

/**
 * Sub-vendor sign-up gate — the shared onboarding gate with sub-vendor copy.
 *
 * This used to be a second near-identical copy of the organizer gate: same
 * markup, same layout bug, and copy already drifting apart from it.
 */
const COPY: GateCopy = {
  eyebrow: 'SUB-VENDOR SIGN-UP',
  heading: 'Get booked for the events organizers are already running',
  blurb:
    'Caterers, decorators, photographers and more — join the organizers you already work with and get their jobs in one place.',
  points: SUBVENDOR_GATE.points,
  stepsTitle: 'What signing up involves',
  steps: SUBVENDOR_GATE.steps,
  formSub: 'Sub-vendor signup uses the same secure login as the Evently app. No password to remember.',
};

export function AuthGate() {
  return <OnboardingGate copy={COPY} />;
}
