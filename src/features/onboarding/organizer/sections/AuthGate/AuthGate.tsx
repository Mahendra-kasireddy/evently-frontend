import { OnboardingGate, type GateCopy } from '../../../shared/OnboardingGate';
import { GATE_POINTS, ONBOARDING_STEPS, ONB_COPY } from '../../constants';

/**
 * Organizer sign-up gate — the shared onboarding gate with organizer copy.
 *
 * The steps come from `ONBOARDING_STEPS`, the same constant the wizard itself
 * renders, so this preview can never advertise a flow that doesn't exist.
 */
const COPY: GateCopy = {
  eyebrow: 'ORGANIZER SIGN-UP',
  heading: 'Grow your events business with Evently',
  blurb:
    'Get matched with families planning weddings, naming ceremonies and celebrations near you — and quote for the ones you want.',
  points: GATE_POINTS,
  stepsTitle: 'What onboarding involves',
  steps: ONBOARDING_STEPS.map((s) => s.title),
  note: ONB_COPY.verifyNote,
  formSub: 'Onboarding uses the same secure login as the Evently app. No password to remember.',
};

export function AuthGate() {
  return <OnboardingGate copy={COPY} />;
}
