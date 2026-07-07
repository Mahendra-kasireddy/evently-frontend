import { Link } from 'react-router-dom';
import { MapPin, ChevronDown, Bell } from 'lucide-react';
import styles from './AppHeader.module.css';

export interface AppNavItem {
  label: string;
  to: string;
  active?: boolean;
}
export interface AppHeaderUser {
  initials: string;
  location: string;
}
export interface AppHeaderProps {
  nav: AppNavItem[];
  user: AppHeaderUser;
  hasNotifications?: boolean;
}

/** Logged-in app header: logo, primary nav, location, notifications, avatar. */
export function AppHeader({ nav, user, hasNotifications = true }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/home" className={styles.logo}>
          <span className={styles.logoAccent}>e</span>vently
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`${styles.navLink} ${item.active ? styles.navActive : ''}`}
              {...(item.active ? { 'aria-current': 'page' } : {})}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <button type="button" className={styles.location}>
            <MapPin size={15} className={styles.pin} />
            <span>{user.location}</span>
            <ChevronDown size={15} className={styles.caret} />
          </button>
          <button type="button" className={styles.bell} aria-label="Notifications">
            <Bell size={18} />
            {hasNotifications && <span className={styles.dot} aria-hidden />}
          </button>
          <button type="button" className={styles.avatar} aria-label="Account">
            {user.initials}
          </button>
        </div>
      </div>
    </header>
  );
}
