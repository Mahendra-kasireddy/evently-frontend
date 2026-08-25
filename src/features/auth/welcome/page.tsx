import { WelcomeContainer } from './container';

/**
 * Post-OTP onboarding: preferred name, then location.
 *
 * No header of its own — this route sits inside CustomerLayout, which renders
 * the same app header every other customer screen uses.
 */
export function WelcomePage() {
  return <WelcomeContainer />;
}

export default WelcomePage;
