import { Header } from '@shared/components';
import { isInApp } from '@lib/native';
import { SubvendorOnboardingContainer } from './container';
import styles from './styles.module.css';

/**
 * Sub-vendor onboarding entry (/onboarding/subvendor).
 *
 * Inside the mobile app the app draws its own header, so the site's is left
 * out rather than stacked under it.
 */
export function SubvendorOnboardingPage() {
  const inApp = isInApp();
  return (
    <>
      {!inApp && <Header variant="auth" authCta={{ prompt: '', label: 'Save as draft', to: '/' }} />}
      <main className={styles.page}>
        <SubvendorOnboardingContainer />
      </main>
    </>
  );
}

export default SubvendorOnboardingPage;
