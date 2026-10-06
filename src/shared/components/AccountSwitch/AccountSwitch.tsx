import { LogOut, Repeat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useSwitchRole } from '@app/auth';
import styles from './AccountSwitch.module.css';

export interface AccountSwitchProps {
  /** Who the account is in this portal, for the copy: "organizer" or "sub-vendor". */
  portalLabel: string;
  /** Off where the page already has its own sign-out. */
  showSignOut?: boolean;
}

/**
 * The way out of a business portal: over to the customer side, or signed out.
 *
 * Both already exist in the desktop rail, but the rail is hidden on a phone —
 * and on a phone, inside the mobile app, is exactly where a business account
 * spends its time. Without this card it had no way back to the customer app
 * and no way to sign out.
 */
export function AccountSwitch({ portalLabel, showSignOut = true }: AccountSwitchProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { switchTo, switching, error } = useSwitchRole();

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <section className={styles.card} aria-label="Account">
      <div className={styles.text}>
        <h2 className={styles.title}>Planning an event of your own?</h2>
        <p className={styles.note}>
          Switch to the customer side. Evently will open there next time too — you can switch back
          to your {portalLabel} dashboard from your profile.
        </p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          disabled={switching}
          onClick={() => switchTo('customer')}
        >
          <Repeat size={16} /> {switching ? 'Switching…' : 'Switch to customer'}
        </button>
        {showSignOut && (
          <button type="button" className={styles.secondary} onClick={handleSignOut}>
            <LogOut size={16} /> Log out
          </button>
        )}
      </div>
    </section>
  );
}

export default AccountSwitch;
