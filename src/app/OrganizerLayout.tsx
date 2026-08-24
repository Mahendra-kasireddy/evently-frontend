import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Home as HomeIcon,
  LogOut,
  Medal,
  MessageSquare,
  PartyPopper,
  Search,
  Sparkles,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllNotificationsReadMutation,
  type NotificationItem,
} from '@features/customer/home/notifications.service';
import { useGetOrganizerBadgesQuery } from '@features/organizer/bookings/service';
import { useGetMyOrganizerProfileQuery } from '@features/organizer/profile/service';
import { useAuth } from './auth';
import styles from './OrganizerLayout.module.css';

interface NavItem {
  /** Stable identity — two items may share a `to`, so labels/paths aren't keys. */
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  /**
   * Screens this item owns outright, even though they aren't its `to`. A quote
   * only exists inside an enquiry, so "Quote builder" owns the drill-in rather
   * than linking to a param-less route of its own.
   */
  owns?: string[];
  /**
   * Sent as router location state so two items pointing at the same screen stay
   * distinguishable for the active highlight.
   */
  state?: { nav: string };
}

/**
 * Order, labels and icons mirror the reference design's organizer rail
 * (screens P-04..P-11). The design lists "Quote builder" as a top-level
 * destination, but a quote is always composed against a specific enquiry —
 * there is no param-less quote screen — so it shares Enquiries' destination
 * and owns `/organizer/respond/:requestId`.
 */
const NAV: NavItem[] = [
  { id: 'home', label: 'Home', to: '/organizer/home', icon: HomeIcon },
  { id: 'enquiries', label: 'Enquiries', to: '/organizer/quotes', icon: MessageSquare },
  {
    id: 'events',
    label: 'Active events',
    to: '/organizer/events',
    icon: PartyPopper,
    // The guest-invitation builder is opened from an event, so it belongs here.
    owns: ['/organizer/invitation'],
  },
  {
    id: 'quote-builder',
    label: 'Quote builder',
    to: '/organizer/quote-builder',
    icon: FileText,
    // The per-enquiry builder belongs to this item, not to Enquiries.
    owns: ['/organizer/respond'],
  },
  { id: 'subvendors', label: 'Sub-vendors', to: '/organizer/subvendors', icon: Users },
  { id: 'calendar', label: 'Calendar', to: '/organizer/calendar', icon: CalendarDays },
  { id: 'earnings', label: 'Earnings', to: '/organizer/earnings', icon: Wallet },
  { id: 'badges', label: 'Badges', to: '/organizer/badges', icon: Medal },
  { id: 'academy', label: 'Academy', to: '/organizer/academy', icon: BookOpen },
  { id: 'profile', label: 'Profile', to: '/organizer/profile', icon: User },
];

const matchesPath = (pathname: string, prefix: string): boolean =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

/**
 * Which rail item to highlight. An owned screen wins outright; otherwise the
 * destination decides, and when two items share one, the state set by the click
 * breaks the tie. Landing on a shared destination without that state (a direct
 * URL, a refresh, a redirect) falls back to the first item declaring it.
 */
function activeNavId(pathname: string, navState: string | undefined): string | undefined {
  const owner = NAV.find((item) => item.owns?.some((prefix) => matchesPath(pathname, prefix)));
  if (owner) return owner.id;

  const candidates = NAV.filter((item) => matchesPath(pathname, item.to));
  if (candidates.length < 2) return candidates[0]?.id;
  return (candidates.find((item) => item.state?.nav === navState) ?? candidates[0])?.id;
}

/**
 * The design shows the current screen's name in the top bar rather than
 * repeating it as an in-page H1, so content starts straight at the cards.
 */
const TITLES: Array<[prefix: string, title: string]> = [
  ['/organizer/home', 'Home'],
  ['/organizer/quotes', 'Enquiries'],
  // More specific first: the drill-in is its own screen (P-07), the list is not.
  ['/organizer/events/', 'Event execution'],
  ['/organizer/events', 'Active events'],
  ['/organizer/invitation', 'Invitation setup'],
  ['/organizer/quote-builder', 'Quote builder'],
  ['/organizer/respond', 'Quote builder'],
  ['/organizer/subvendors', 'Sub-vendors'],
  ['/organizer/calendar', 'Calendar'],
  ['/organizer/earnings', 'Earnings'],
  ['/organizer/badges', 'Badges & tiers'],
  ['/organizer/academy', 'Evently Academy'],
  ['/organizer/profile', 'Profile'],
];

const titleFor = (pathname: string): string =>
  TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? 'Organizer';

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

/**
 * Persistent shell for authenticated organizer screens: a dark sidebar
 * (the whole "Organizer & Sub-vendor" surface lives under it) plus a light
 * content pane with its own compact top bar. Deliberately its own shell
 * rather than the customer AppHeader — the organizer product is an
 * internal working tool, not a marketing-site page, so no footer either.
 */
export function OrganizerLayout() {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  const activeId = activeNavId(pathname, (state as { nav?: string } | null)?.nav);
  const { user: sessionUser, signOut } = useAuth();
  const { data: unread = 0 } = useGetUnreadCountQuery();
  const { data: notifications = [] } = useGetMyNotificationsQuery();
  const { data: badges } = useGetOrganizerBadgesQuery();
  const { data: profile } = useGetMyOrganizerProfileQuery();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const term = searchTerm.trim();
    navigate(term ? `/organizer/quotes?q=${encodeURIComponent(term)}` : '/organizer/quotes');
  };

  useEffect(() => {
    if (!bellOpen) return;
    const onDown = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [bellOpen]);

  /**
   * The design identifies the signed-in partner by their *business*, not the
   * contact person, and the session user is null after a hard refresh — so the
   * organizer profile is the source of truth here, with the session name as a
   * fallback while it loads.
   */
  const businessName =
    profile?.displayName?.trim() || profile?.businessName?.trim() || sessionUser?.name || 'Your business';
  const tier = badges?.currentTier ?? 'Bronze';

  const initials =
    businessName
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'O';

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
        <Link to="/organizer/home" className={styles.logo}>
          <span className={styles.logoE}>e</span>vently
        </Link>

        <nav className={styles.nav} aria-label="Organizer">
          {NAV.map((item) => {
            const active = item.id === activeId;
            return (
              <Link
                key={item.id}
                to={item.to}
                state={item.state ?? null}
                aria-current={active ? 'page' : undefined}
                className={`${styles.navItem} ${active ? styles.navActive : ''}`}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFoot}>
          <button type="button" className={styles.navItem} onClick={handleSignOut}>
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>{titleFor(pathname)}</h1>

          <div className={styles.topbarRight}>
            <form className={styles.search} onSubmit={submitSearch} role="search">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
            <div className={styles.topbarActions} ref={bellRef}>
              <button
                type="button"
                className={styles.bell}
                aria-label="Notifications"
                onClick={() => setBellOpen((v) => !v)}
              >
                <Bell size={20} />
                {unread > 0 && <span className={styles.dot}>{unread > 9 ? '9+' : unread}</span>}
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
            <Link to="/organizer/profile" className={styles.identity}>
              <span className={styles.avatar}>{initials}</span>
              <span className={styles.userInfo}>
                <span className={styles.userName}>{businessName}</span>
                <span className={styles.userTier}>{tier} organizer</span>
              </span>
            </Link>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
