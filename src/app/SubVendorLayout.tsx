import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  CreditCard,
  FileText,
  LayoutList,
  LogOut,
  Settings,
  Sparkles,
  User,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { prefetchRoute, warmRoutes } from './prefetch';
import {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllNotificationsReadMutation,
  type NotificationItem,
} from '@features/customer/home/notifications.service';
import { useAuth } from './auth';
import styles from './OrganizerLayout.module.css';

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { label: 'Tasks', to: '/subvendor/home', icon: LayoutList },
  { label: 'Payments', to: '/subvendor/payments', icon: Wallet },
  { label: 'Profile', to: '/subvendor/profile', icon: User },
];

const NOTIF_STYLE: Record<NotificationItem['type'], { icon: LucideIcon; color: string; soft: string }> = {
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

/** Persistent shell for authenticated sub-vendor screens — mirrors OrganizerLayout's shape/CSS. */
export function SubVendorLayout() {
  const { pathname } = useLocation();

  // Warm the section chunks on idle so the first click never waits on JS.
  useEffect(() => warmRoutes(NAV.map((item) => item.to)), []);
  const navigate = useNavigate();
  const { user: sessionUser, signOut } = useAuth();
  const { data: unread = 0 } = useGetUnreadCountQuery();
  const { data: notifications = [] } = useGetMyNotificationsQuery();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bellOpen) return;
    const onDown = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [bellOpen]);

  const initials = (sessionUser?.name ?? 'Sub-vendor')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const renderNotifRow = (n: NotificationItem) => {
    const { icon: Ic, color, soft } = NOTIF_STYLE[n.type] ?? NOTIF_STYLE.system;
    const body = (
      <>
        <span className={styles.notifIcon} style={{ background: soft }}>
          <Ic size={15} color={color} />
        </span>
        <span className={styles.notifBody}>
          <span className={styles.notifTitle}>{n.title}</span>
          <span className={styles.notifTime}>{timeAgo(n.createdAt)}</span>
        </span>
        {!n.read && <span className={styles.notifDot} aria-hidden />}
      </>
    );
    const cls = `${styles.notifRow} ${!n.read ? styles.notifUnread : ''}`;
    return n.link ? (
      <Link key={n.id} to={n.link} className={cls} onClick={() => setBellOpen(false)}>
        {body}
      </Link>
    ) : (
      <div key={n.id} className={cls}>
        {body}
      </div>
    );
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to="/subvendor/home" className={styles.logo}>
          <span className={styles.logoMark}>e</span>vently
        </Link>

        <nav className={styles.nav} aria-label="Sub-vendor">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`${styles.navItem} ${active ? styles.navActive : ''}`}
                onMouseEnter={() => prefetchRoute(item.to)}
                onFocus={() => prefetchRoute(item.to)}
                onTouchStart={() => prefetchRoute(item.to)}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFoot}>
          {/* Marked active like every other nav item — it sat outside the
              loop above, so the sidebar never showed where you were. */}
          <Link
            to="/subvendor/settings"
            className={`${styles.navItem} ${
              pathname.startsWith('/subvendor/settings') ? styles.navActive : ''
            }`}
          >
            <Settings size={17} />
            Settings
          </Link>
          <button type="button" className={styles.navItem} onClick={handleSignOut}>
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarActions} ref={bellRef}>
            <button
              type="button"
              className={styles.bell}
              aria-label="Notifications"
              onClick={() => setBellOpen((v) => !v)}
            >
              <Bell size={18} />
              {unread > 0 && <span className={styles.dot} aria-hidden />}
            </button>
            {bellOpen && (
              <div className={styles.notifPanel} role="menu">
                <div className={styles.notifHead}>
                  <span>Notifications</span>
                  {unread > 0 && (
                    <button type="button" className={styles.markRead} onClick={() => void markAllRead()}>
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className={styles.notifEmpty}>You&rsquo;re all caught up.</p>
                ) : (
                  <div className={styles.notifList}>{notifications.slice(0, 8).map(renderNotifRow)}</div>
                )}
              </div>
            )}
          </div>
          <span className={styles.avatar}>{initials || 'SV'}</span>
          <span className={styles.userName}>{sessionUser?.name ?? 'Sub-vendor'}</span>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
