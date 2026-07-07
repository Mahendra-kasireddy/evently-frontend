import { Header } from '@shared/components';
import { JoinContainer } from './container';
import styles from './styles.module.css';

/** Role-selection entry. Slim auth header + centered card. */
export function JoinPage() {
  return (
    <>
      <Header
        variant="auth"
        authCta={{ prompt: 'Already have an account?', label: 'Sign In', to: '/login' }}
      />
      <main className={styles.page}>
        <JoinContainer />
      </main>
    </>
  );
}

export default JoinPage;
