import { Header } from '@shared/components';
import { isInApp } from '@lib/native';
import { OrganizerOnboardingContainer } from './container';
import styles from './styles.module.css';

/**
 * Organizer sign-up entry (/onboarding/organizer).
 *
 * Inside the mobile app the app draws its own header, so the site's — logo,
 * help, theme toggle, "Save & exit" — would be a second, browser-only one.
 */
export function OrganizerOnboardingPage() {
  const inApp = isInApp();
  return (
    <>
      {!inApp && <Header variant="auth" authCta={{ prompt: '', label: 'Save & exit', to: '/' }} />}
      <main className={`${styles.page} ${inApp ? styles.pageInApp : ''}`}>
        <OrganizerOnboardingContainer />
      </main>
    </>
  );
}

export default OrganizerOnboardingPage;
