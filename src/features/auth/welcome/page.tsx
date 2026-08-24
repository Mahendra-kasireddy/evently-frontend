import { Header } from '@shared/components';
import { WelcomeContainer } from './container';

/** Post-OTP onboarding: preferred name, then location. */
export function WelcomePage() {
  return (
    <>
      <Header variant="auth" authCta={{ prompt: '', label: '', to: '/home' }} />
      <WelcomeContainer />
    </>
  );
}

export default WelcomePage;
