import { OnboardingGate, type GateCopy } from '../../../shared/OnboardingGate';
import { GATE_POINTS, ONB_COPY, SIGNUP_STEPS } from '../../constants';

/**
 * Organizer sign-up gate — the shared onboarding gate with organizer copy.
 *
 * The steps are the real sign-up path — verify, basics, dashboard, go live —
 * so the preview never advertises a longer form than the one that follows.
 */
const COPY: GateCopy = {
  eyebrow: 'ORGANIZER SIGN-UP',
  heading: 'Grow your events business with Evently',
  blurb:
    'Get matched with families planning weddings, naming ceremonies and celebrations near you — and quote for the ones you want.',
  points: GATE_POINTS,
  stepsTitle: 'How it works',
  steps: SIGNUP_STEPS,
  note: ONB_COPY.verifyNote,
  formSub: 'Onboarding uses the same secure login as the Evently app. No password to remember.',
};

export function AuthGate() {
  return <OnboardingGate copy={COPY} />;
}
