import { Header } from '@shared/components';
import { LoginContainer } from './container';
import styles from './styles.module.css';

/**
 * Login entry. App header on top, then a centered two-panel card on a neutral
 * backdrop. Default-exported for the router's lazy import.
 */
export function LoginPage() {
  return (
    <>
      <Header variant="auth" authCta={{ prompt: 'New to Evently?', label: 'Create account', to: '/join' }} />
      <main className={styles.page}>
        <LoginContainer />
      </main>
    </>
  );
}

export default LoginPage;
