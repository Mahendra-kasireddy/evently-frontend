import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, ChevronDown, Bell, FileText, CheckCircle2, CreditCard,
  Sparkles, Heart, User, Calendar, Settings, LogOut, type LucideIcon,
} from 'lucide-react';
import { LocationPicker, readRecentCities } from '../LocationPicker';
import styles from './AppHeader.module.css';

export interface AppNavItem {
  label: string;
  to: string;
  active?: boolean;
}

export type HeaderNotificationType = 'booking' | 'quote' | 'payment' | 'system';

export interface HeaderNotification {
  id: string;
  type: HeaderNotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface AppHeaderUser {
  initials: string;
  location: string;
  name: string;
  email: string;
  /** Role badge shown in the profile card (defaults to "Customer"). */
  role?: string;
}

export interface ProfileMenuItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export interface AppHeaderProps {
  nav: AppNavItem[];
  user: AppHeaderUser;
  /** City options for the location menu. Omit to render location as plain text. */
  cityOptions?: string[];
  citiesLoading?: boolean;
  /** Persist a newly chosen city. Omit to render location as plain text. */
  onSelectCity?: (city: string) => void;
  isSavingCity?: boolean;
  notifications?: HeaderNotification[];
  hasNotifications?: boolean;
  onSignOut?: () => void;
  onMarkAllRead?: () => void;
  onNotificationClick?: (n: HeaderNotification) => void;
  /** Overrides the default customer profile-dropdown links (e.g. for a non-customer role). */
  profileMenu?: ProfileMenuItem[];
  /** Overrides the logo's link destination (defaults to "/home"). */
  homeTo?: string;
}

/** Profile dropdown links — app-wide, so defined here rather than passed in. */
const PROFILE_MENU: ProfileMenuItem[] = [
  { label: 'Profile', to: '/profile', icon: User },
  { label: 'My bookings', to: '/workspace', icon: Calendar },
  { label: 'My invitation', to: '/my-invitation', icon: Heart },
  { label: 'Settings', to: '/settings', icon: Settings },
];

/** Icon + colour treatment per notification type. */
const NOTIF_STYLE: Record<HeaderNotificationType, { icon: LucideIcon; color: string; soft: string }> = {
  quote: { icon: FileText, color: '#e8633a', soft: '#fdeee7' },
  booking: { icon: CheckCircle2, color: '#1d9e75', soft: '#e7f4ee' },
  payment: { icon: CreditCard, color: '#ba7517', soft: '#f7efe1' },
  system: { icon: Sparkles, color: '#1a2e5a', soft: '#eef1f7' },
};

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

/** Logged-in app header: logo, primary nav, location, notifications, avatar. */
export function AppHeader({
  nav,
  user,
  cityOptions,
  citiesLoading,
  onSelectCity,
  isSavingCity,
  notifications = [],
  hasNotifications = true,
  onSignOut,
  onMarkAllRead,
  onNotificationClick,
  profileMenu = PROFILE_MENU,
  homeTo = '/home',
}: AppHeaderProps) {
  const [open, setOpen] = useState<'bell' | 'profile' | 'location' | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Close on outside pointer-down and on Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (m: 'bell' | 'profile' | 'location') => setOpen((prev) => (prev === m ? null : m));
  const close = () => setOpen(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const showDot = notifications.length ? unreadCount > 0 : hasNotifications;
  const today = notifications.filter((n) => isToday(n.createdAt));
  const earlier = notifications.filter((n) => !isToday(n.createdAt));
  const role = user.role ?? 'Customer';

  const renderRow = (n: HeaderNotification) => {
    const { icon: Ic, color, soft } = NOTIF_STYLE[n.type] ?? NOTIF_STYLE.system;
    const body = (
      <>
        <span className={styles.notifIcon} style={{ background: soft }}>
          <Ic size={16} color={color} />
        </span>
        <span className={styles.notifBody}>
          <span className={styles.notifTitle}>{n.title}</span>
          <span className={styles.notifSub}>{n.body}</span>
          <span className={styles.notifTime}>{timeAgo(n.createdAt)}</span>
        </span>
        {!n.read && <span className={styles.notifDot} aria-hidden />}
      </>
    );
    const cls = `${styles.notifRow} ${!n.read ? styles.notifUnread : ''}`;
    const handle = () => {
      close();
      onNotificationClick?.(n);
    };
    return n.link ? (
      <Link key={n.id} to={n.link} className={cls} onClick={handle}>
        {body}
      </Link>
    ) : (
      <button key={n.id} type="button" className={cls} onClick={handle}>
        {body}
      </button>
    );
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={homeTo} className={styles.logo}>
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

        <div className={styles.actions} ref={actionsRef}>
          {onSelectCity ? (
            <div className={styles.menuWrap}>
              <button
                type="button"
                className={styles.location}
                onClick={() => toggle('location')}
                aria-haspopup="true"
                aria-expanded={open === 'location'}
              >
                <MapPin size={15} className={styles.pin} />
                <span>{user.location || 'Select your location'}</span>
                <ChevronDown size={15} className={styles.caret} />
              </button>
              {open === 'location' && (
                <div className={styles.panel}>
                  <div className={`${styles.panelCard} ${styles.locationCard}`}>
                    <LocationPicker
                      cities={cityOptions ?? []}
                      citiesLoading={citiesLoading}
                      recent={readRecentCities()}
                      selected={user.location || undefined}
                      busy={isSavingCity}
                      onSelect={(city) => {
                        onSelectCity(city);
                        close();
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <span className={styles.location}>
              <MapPin size={15} className={styles.pin} />
              <span>{user.location}</span>
            </span>
          )}

          {/* Notifications */}
          <div className={styles.menuWrap}>
            <button
              type="button"
              className={`${styles.bell} ${open === 'bell' ? styles.bellActive : ''}`}
              aria-label="Notifications"
              aria-haspopup="true"
              aria-expanded={open === 'bell'}
              onClick={() => toggle('bell')}
            >
              <Bell size={18} />
              {showDot && <span className={styles.dot} aria-hidden />}
            </button>

            {open === 'bell' && (
              <div className={styles.panel}>
                <div className={`${styles.panelCard} ${styles.notifCard}`} role="menu">
                  <div className={styles.panelHead}>
                    <span className={styles.panelTitle}>Notifications</span>
                    {unreadCount > 0 && onMarkAllRead && (
                      <button
                        type="button"
                        className={styles.markRead}
                        onClick={() => onMarkAllRead()}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className={styles.notifEmpty}>You&rsquo;re all caught up.</div>
                  ) : (
                    <div className={styles.notifList}>
                      {today.length > 0 && (
                        <>
                          <div className={styles.groupLabel}>TODAY</div>
                          {today.map(renderRow)}
                        </>
                      )}
                      {earlier.length > 0 && (
                        <>
                          <div className={`${styles.groupLabel} ${today.length > 0 ? styles.groupDivider : ''}`}>
                            EARLIER
                          </div>
                          {earlier.map(renderRow)}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile — opens on hover and click */}
          <div
            className={styles.menuWrap}
            onMouseEnter={() => setOpen('profile')}
            onMouseLeave={() => setOpen((prev) => (prev === 'profile' ? null : prev))}
          >
            <button
              type="button"
              className={`${styles.avatarBtn} ${open === 'profile' ? styles.avatarActive : ''}`}
              aria-label="Account"
              aria-haspopup="true"
              aria-expanded={open === 'profile'}
              onClick={() => toggle('profile')}
            >
              <span className={styles.avatar}>{user.initials}</span>
            </button>

            {open === 'profile' && (
              <div className={`${styles.panel} ${styles.panelRight}`}>
                <div className={`${styles.panelCard} ${styles.profileCard}`} role="menu">
                  <div className={styles.profHead}>
                    <span className={styles.avatarLg}>{user.initials}</span>
                    <span className={styles.profMeta}>
                      <span className={styles.profName}>{user.name}</span>
                      <span className={styles.profEmail}>{user.email}</span>
                      <span className={styles.rolePill}>
                        <Heart size={11} className={styles.rolePillIcon} />
                        {role}
                      </span>
                    </span>
                  </div>

                  <div className={styles.menuGroup}>
                    {profileMenu.map(({ label, to, icon: Ic }) => (
                      <Link key={label} to={to} className={styles.menuItem} onClick={close}>
                        <Ic size={17} className={styles.menuIcon} />
                        {label}
                      </Link>
                    ))}
                  </div>

                  <button
                    type="button"
                    className={styles.signOut}
                    onClick={() => {
                      close();
                      onSignOut?.();
                    }}
                  >
                    <LogOut size={17} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
