import { Header } from '@shared/components';
import { OrganizerOnboardingContainer } from './container';
import styles from './styles.module.css';

/** Organizer onboarding entry (/onboarding/organizer). */
export function OrganizerOnboardingPage() {
  return (
    <>
      <Header variant="auth" authCta={{ prompt: '', label: 'Save & exit', to: '/' }} />
      <main className={styles.page}>
        <OrganizerOnboardingContainer />
      </main>
    </>
  );
}

export default OrganizerOnboardingPage;
