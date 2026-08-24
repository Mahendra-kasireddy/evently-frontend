import { useState } from 'react';
import { useAuth } from '@app/auth';
import { useLogin } from './hooks';
import { Component } from './Component';
import { LoginPromo, SignedIn } from './sections';
import styles from './styles.module.css';

/**
 * Orchestration: runs the two-step login hook and passes it to the card.
 *
 * When a session already exists (the user pressed Back into /login, or clicked
 * "Login" again), the OTP form is pointless — verifying the same number returns
 * the same account — so the destinations are offered directly, with signing out
 * as the explicit route to a different number.
 */
export function LoginContainer() {
  const { status, user, roles, signOut } = useAuth();
  const [forceForm, setForceForm] = useState(false);
  const login = useLogin();

  if (status === 'authenticated' && !forceForm) {
    return (
      <div className={styles.card}>
        <LoginPromo />
        <SignedIn
          who={user?.name || user?.email || ''}
          isOrganizer={roles.includes('organizer')}
          onUseAnotherNumber={() => {
            signOut();
            setForceForm(true);
          }}
        />
      </div>
    );
  }

  return <Component login={login} />;
}
