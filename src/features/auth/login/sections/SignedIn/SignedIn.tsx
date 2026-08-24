import { Link } from 'react-router-dom';
import { CheckCircle2, LayoutDashboard, UserRound } from 'lucide-react';
import { Button } from '@shared/reusable';
import { SIGNED_IN } from '../../constants';
import styles from './SignedIn.module.css';

export interface SignedInProps {
  /** Name or mobile of the session, when the app knows it. */
  who: string;
  /** True when the session already carries the organizer role. */
  isOrganizer: boolean;
  /** Sign out and fall back to the mobile + OTP form. */
  onUseAnotherNumber: () => void;
}

/**
 * Shown instead of the OTP form when a session already exists. Re-verifying a
 * number you are already signed in with achieves nothing — the same user is
 * returned — so this offers the two destinations directly and keeps signing out
 * as the explicit way to switch numbers.
 */
export function SignedIn({ who, isOrganizer, onUseAnotherNumber }: SignedInProps) {
  return (
    <div className={styles.panel}>
      <span className={styles.badge}>
        <CheckCircle2 size={22} />
      </span>
      <h1 className={styles.title}>{SIGNED_IN.title}</h1>
      <p className={styles.subtitle}>
        {who ? `${SIGNED_IN.subtitleWho} ${who}.` : SIGNED_IN.subtitle} {SIGNED_IN.pick}
      </p>

      <div className={styles.actions}>
        <Link to="/home" className={styles.primaryLink}>
          <UserRound size={16} /> {SIGNED_IN.continueCustomer}
        </Link>
        <Link to="/onboarding/organizer" className={styles.secondaryLink}>
          <LayoutDashboard size={16} />
          {isOrganizer ? SIGNED_IN.continueOrganizer : SIGNED_IN.becomeOrganizer}
        </Link>
      </div>

      <div className={styles.divider} />

      <p className={styles.switchNote}>{SIGNED_IN.switchNote}</p>
      <Button variant="secondary" onClick={onUseAnotherNumber} className={styles.switchBtn}>
        {SIGNED_IN.switchCta}
      </Button>
    </div>
  );
}

export default SignedIn;
