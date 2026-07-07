import { Header } from '@shared/components';
import { SubvendorOnboardingContainer } from './container';
import styles from './styles.module.css';

/** Sub-vendor onboarding entry (/onboarding/subvendor). */
export function SubvendorOnboardingPage() {
  return (
    <>
      <Header variant="auth" authCta={{ prompt: '', label: 'Save as draft', to: '/' }} />
      <main className={styles.page}>
        <SubvendorOnboardingContainer />
      </main>
    </>
  );
}

export default SubvendorOnboardingPage;
