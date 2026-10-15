import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Bell,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  FileText,
  Home as HomeIcon,
  LogOut,
  MessageSquare,
  PartyPopper,
  Search,
  Sparkles,
  Sprout,
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
import { useGetOrganizerBadgesQuery } from '@features/organizer/bookings/service';
import { useGetMyOrganizerProfileQuery } from '@features/organizer/profile/service';
import {
  BottomTabs,
  BottomTabsSpacer,
  type BottomTabItem,
} from '@shared/components';
import { useAuth } from './auth';
import styles from './OrganizerLayout.module.css';

/** One screen inside a section — a tab under the top bar. */
interface SectionTab {
  label: string;
  /** A shorter name for a phone's tab row, where four full names do not fit. */
  short?: string;
  to: string;
  /**
   * Screens this tab owns outright, though they are not its `to` — a drill-in
   * opened from it (an event's invitation, one enquiry's quote).
   */
  owns?: string[];
}

/** A top-bar destination: one or more screens that are used together. */
interface Section {
  id: string;
  label: string;
  icon: LucideIcon;
  tabs: SectionTab[];
}

/**
 * The organizer's navigation, grouped by where each feature is used.
 *
 * Twelve rail items became six sections. Screens that serve the same job sit
 * side by side as tabs: an enquiry and the quote that answers it; a booking,
 * the calendar it occupies, the sub-vendors who work it and the ticketed
 * events beside it; the money earned and the coupons that discount it; the
 * badge ladder and the Academy that climbs it. Profile lives in the avatar
 * menu, where the account belongs.
 *
 * Every route is unchanged — deep links, notifications and the mobile app's
 * WebView keep working; only the way between them moved.
 */
const SECTIONS: Section[] = [
  {
    id: 'home',
    label: 'Home',
    icon: HomeIcon,
    tabs: [
      { label: 'Dashboard', to: '/organizer/home', owns: ['/organizer/setup'] },
    ],
  },
  {
    id: 'enquiries',
    label: 'Enquiries',
    icon: MessageSquare,
    tabs: [
      { label: 'Inbox', to: '/organizer/quotes' },
      {
        label: 'Quote builder',
        to: '/organizer/quote-builder',
        owns: ['/organizer/respond'],
      },
    ],
  },
  {
    id: 'events',
    label: 'Events',
    icon: PartyPopper,
    tabs: [
      {
        label: 'Active events',
        short: 'Events',
        to: '/organizer/events',
        owns: ['/organizer/invitation'],
      },
      { label: 'Calendar', to: '/organizer/calendar' },
      { label: 'Sub-vendors', short: 'Vendors', to: '/organizer/subvendors' },
      {
        label: 'Public events',
        short: 'Tickets',
        to: '/organizer/public-events',
      },
    ],
  },
  {
    id: 'earnings',
    label: 'Earnings',
    icon: Wallet,
    tabs: [
      { label: 'Earnings', to: '/organizer/earnings' },
      { label: 'Coupons', to: '/organizer/coupons' },
    ],
  },
  {
    id: 'grow',
    label: 'Grow',
    icon: Sprout,
    tabs: [
      { label: 'Badges & tiers', to: '/organizer/badges' },
      { label: 'Academy', to: '/organizer/academy' },
    ],
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    tabs: [{ label: 'Profile', to: '/organizer/profile' }],
  },
];

/** The sections drawn in the top bar; Profile is reached from the avatar. */
const TOP_SECTIONS = SECTIONS.filter((s) => s.id !== 'profile');

const matchesPath = (pathname: string, prefix: string): boolean =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

const tabOwns = (tab: SectionTab, pathname: string): boolean =>
  matchesPath(pathname, tab.to) ||
  Boolean(tab.owns?.some((p) => matchesPath(pathname, p)));

/** The section and tab that own the current URL. */
function locate(pathname: string): { section?: Section; tab?: SectionTab } {
  for (const section of SECTIONS) {
    // An owned drill-in wins over a plain prefix: /organizer/respond is the
    // quote builder's, not the inbox's.
    const owner = section.tabs.find((t) =>
      t.owns?.some((p) => matchesPath(pathname, p)),
    );
    if (owner) return { section, tab: owner };
  }
  for (const section of SECTIONS) {
    const tab = section.tabs.find((t) => tabOwns(t, pathname));
    if (tab) return { section, tab };
  }
  return {};
}

/**
 * The screen's own name, shown as the page heading under the top bar. More
 * specific prefixes first: one event is its own screen, the list is not.
 */
const TITLES: Array<[prefix: string, title: string]> = [
  ['/organizer/home', 'Dashboard'],
  ['/organizer/setup', 'Go-live setup'],
  ['/organizer/quotes', 'Enquiries'],
  // Most specific first: the ideas board sits under one event's workspace.
  ['/organizer/events/*/ideas', 'Ideas & planning board'],
  ['/organizer/events/', 'Workspace'],
  ['/organizer/events', 'Active events'],
  ['/organizer/invitation', 'Guest invitation'],
  ['/organizer/public-events/', 'Event workspace'],
  ['/organizer/public-events', 'Public events'],
  ['/organizer/quote-builder', 'Quote builder'],
  ['/organizer/respond', 'Build a quote'],
  ['/organizer/subvendors', 'Sub-vendors'],
  ['/organizer/coupons', 'Coupons'],
  ['/organizer/calendar', 'Calendar'],
  ['/organizer/earnings', 'Earnings'],
  ['/organizer/badges', 'Badges & tiers'],
  ['/organizer/academy', 'Evently Academy'],
  ['/organizer/profile', 'Profile'],
];

/** A prefix may carry one `*` for a single path segment (a booking id). */
const prefixMatches = (pathname: string, prefix: string): boolean => {
  if (!prefix.includes('*')) return pathname.startsWith(prefix);
  const [head = '', tail = ''] = prefix.split('*');
  if (!pathname.startsWith(head)) return false;
  const rest = pathname.slice(head.length);
  const cut = rest.indexOf('/');
  return cut > 0 && rest.slice(cut).startsWith(tail);
};

const titleFor = (pathname: string): string =>
  TITLES.find(([prefix]) => prefixMatches(pathname, prefix))?.[1] ??
  'Organizer';

/**
 * Drill-ins and where their back arrow returns to. A screen reached from the
 * tabs has none: the tabs are the way between those. The event's own screens
 * (its ideas board, its guest invitation) lead back to that event's workspace,
 * not to the list.
 */
const BACK_TO: Array<[match: RegExp, to: (m: RegExpMatchArray) => string]> = [
  [/^\/organizer\/setup/, () => '/organizer/home'],
  [/^\/organizer\/respond/, () => '/organizer/quote-builder'],
  [
    /^\/organizer\/events\/([^/]+)\/ideas/,
    (m) => `/organizer/events/${m[1] ?? ''}`,
  ],
  [/^\/organizer\/events\/[^/]+/, () => '/organizer/events'],
  [
    /^\/organizer\/invitation\/([^/]+)/,
    (m) => `/organizer/events/${m[1] ?? ''}`,
  ],
  [/^\/organizer\/public-events\/[^/]+/, () => '/organizer/public-events'],
];

function backFor(pathname: string): string | undefined {
  for (const [match, to] of BACK_TO) {
    const m = pathname.match(match);
    if (m) return to(m);
  }
  return undefined;
}

const NOTIF_STYLE: Record<
  NotificationItem['type'],
  { icon: LucideIcon; color: string; soft: string }
> = {
  quote: { icon: FileText, color: '#e23d7a', soft: '#fdeaf2' },
  booking: { icon: CheckCircle2, color: '#0f9fb3', soft: '#e2f6f9' },
  payment: { icon: CreditCard, color: '#e07a2e', soft: '#fff1e5' },
  system: { icon: Sparkles, color: '#141a2e', soft: '#f2f3f8' },
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

/** Closes a popover when a press lands outside it. */
function useOutsidePress(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return ref;
}

/**
 * Persistent shell for authenticated organizer screens.
 *
 * A floating pill bar across the top — the logo, six sections, search, the
 * bell, a gradient "Build quote" action and the account menu — and under it
 * the screen's heading with its section's tabs. No side rail: the content has
 * the full width, and on a phone the bottom bar carries the same sections.
 */
export function OrganizerLayout() {
  const { pathname } = useLocation();

  // Each section is its own chunk; warm them once the browser is idle so the
  // first click has nothing to download.
  useEffect(
    () => warmRoutes(SECTIONS.flatMap((s) => s.tabs.map((t) => t.to))),
    [],
  );
  const navigate = useNavigate();
  const { section: activeSection, tab: activeTab } = locate(pathname);
  const backTo = backFor(pathname);
  const { user: sessionUser, signOut } = useAuth();
  const { data: unread = 0 } = useGetUnreadCountQuery();
  const { data: notifications = [] } = useGetMyNotificationsQuery();
  const { data: badges } = useGetOrganizerBadgesQuery();
  const { data: profile } = useGetMyOrganizerProfileQuery();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const bellRef = useOutsidePress(bellOpen, () => setBellOpen(false));
  const menuRef = useOutsidePress(menuOpen, () => setMenuOpen(false));
  const [searchTerm, setSearchTerm] = useState('');

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const term = searchTerm.trim();
    navigate(
      term
        ? `/organizer/quotes?q=${encodeURIComponent(term)}`
        : '/organizer/quotes',
    );
  };

  /**
   * The partner is identified by their business, not the contact person, and
   * the session user is null after a hard refresh — so the organizer profile
   * is the source of truth, with the session name as a fallback while it loads.
   */
  const businessName =
    profile?.displayName?.trim() ||
    profile?.businessName?.trim() ||
    sessionUser?.name ||
    'Your business';
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
      <Link
        key={n.id}
        to={n.link}
        className={cls}
        onClick={() => setBellOpen(false)}
      >
        {body}
      </Link>
    ) : (
      <div key={n.id} className={cls}>
        {body}
      </div>
    );
  };

  /*
   * The phone's bar: five sections, the same ones the top bar shows. Grow is
   * reached from Home's badge card and the avatar menu there; five is the most
   * a bar can hold legibly.
   */
  const BOTTOM_IDS = ['home', 'enquiries', 'events', 'earnings', 'profile'];
  const bottomTabs: BottomTabItem[] = BOTTOM_IDS.flatMap((id) => {
    const section = SECTIONS.find((s) => s.id === id);
    if (!section) return [];
    return [
      {
        id: section.id,
        label: section.label,
        to: section.tabs[0]?.to ?? '/organizer/home',
        icon: section.icon,
        active: section.id === activeSection?.id,
      },
    ];
  });

  const tabs = activeSection?.tabs ?? [];

  return (
    <div className={`${styles.shell} ${backTo ? styles.shellDrill : ''}`}>
      <header className={styles.topWrap}>
        <div className={styles.topbar}>
          <Link
            to="/organizer/home"
            className={styles.logo}
            aria-label="Evently organizer home"
          >
            <span className={styles.logoMark} aria-hidden>
              e
            </span>
            <span className={styles.logoWord}>EVENTLY</span>
            <span className={styles.logoTag}>Partner</span>
          </Link>

          <nav className={styles.nav} aria-label="Organizer">
            {TOP_SECTIONS.map((section) => {
              const active = section.id === activeSection?.id;
              const to = section.tabs[0]?.to ?? '/organizer/home';
              return (
                <Link
                  key={section.id}
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  className={`${styles.navItem} ${active ? styles.navActive : ''}`}
                  onMouseEnter={() =>
                    section.tabs.forEach((t) => prefetchRoute(t.to))
                  }
                  onFocus={() => prefetchRoute(to)}
                  onTouchStart={() => prefetchRoute(to)}
                >
                  {section.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.topbarRight}>
            <form
              className={styles.search}
              onSubmit={submitSearch}
              role="search"
            >
              <Search size={15} aria-hidden />
              <input
                type="search"
                aria-label="Search enquiries"
                placeholder="Search enquiries"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>

            <div className={styles.popAnchor} ref={bellRef}>
              <button
                type="button"
                className={styles.iconBtn}
                aria-label={
                  unread > 0
                    ? `Notifications, ${unread} unread`
                    : 'Notifications'
                }
                aria-expanded={bellOpen}
                onClick={() => setBellOpen((v) => !v)}
              >
                <Bell size={19} />
                {unread > 0 && (
                  <span className={styles.dot}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className={styles.notifPanel} role="menu">
                  <div className={styles.notifHead}>
                    <span>Notifications</span>
                    {unread > 0 && (
                      <button
                        type="button"
                        className={styles.markRead}
                        onClick={() => void markAllRead()}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className={styles.notifEmpty}>
                      You&rsquo;re all caught up.
                    </p>
                  ) : (
                    <div className={styles.notifList}>
                      {notifications.slice(0, 8).map(renderNotifRow)}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link to="/organizer/quote-builder" className={styles.cta}>
              Build quote
            </Link>

            <div className={styles.popAnchor} ref={menuRef}>
              <button
                type="button"
                className={styles.avatarBtn}
                aria-label={`${businessName}, account menu`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span className={styles.avatar}>{initials}</span>
              </button>
              {menuOpen && (
                <div className={styles.menu} role="menu">
                  <div className={styles.menuHead}>
                    <span className={styles.avatarLg}>{initials}</span>
                    <span className={styles.userInfo}>
                      <span className={styles.userName}>{businessName}</span>
                      <span className={styles.userTier}>{tier} organizer</span>
                    </span>
                  </div>
                  <Link
                    to="/organizer/profile"
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User size={16} /> Profile
                  </Link>
                  <Link
                    to="/organizer/badges"
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Sprout size={16} /> Badges &amp; Academy
                  </Link>
                  <button
                    type="button"
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={handleSignOut}
                  >
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/*
        A drill-in (one event's workspace, its ideas board, its invitation, one
        quote) is a screen of its own: a back arrow and its name. On a phone
        this bar replaces the app bar entirely, as a native app's would.
      */}
      {backTo ? (
        <div className={styles.drillBar}>
          <div className={styles.drillInner}>
            <Link to={backTo} className={styles.back} aria-label="Back">
              <ChevronLeft size={24} strokeWidth={2.4} />
            </Link>
            <h1 className={styles.drillTitle}>{titleFor(pathname)}</h1>
          </div>
        </div>
      ) : (
        /* The screen's name, for screen readers only — the tabs and the page's
           own content already say where you are. */
        <h1 className={styles.srOnly}>{titleFor(pathname)}</h1>
      )}

      {!backTo && tabs.length > 1 && (
        /* Sticky under the app bar, so the section's tabs stay in reach while
           its list scrolls. */
        <div className={`${styles.pageHead} ${styles.pageHeadSticky}`}>
          {/* The section's screens, side by side — only when there is a choice,
              and not inside a drill-in, where the chevron is the way back. */}
          {!backTo && tabs.length > 1 && (
            <nav
              className={styles.tabs}
              aria-label={`${activeSection?.label ?? ''} screens`}
            >
              {tabs.map((tab) => {
                const active = tab === activeTab;
                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    aria-current={active ? 'page' : undefined}
                    className={`${styles.tab} ${active ? styles.tabActive : ''}`}
                    onMouseEnter={() => prefetchRoute(tab.to)}
                    onFocus={() => prefetchRoute(tab.to)}
                  >
                    {tab.short ? (
                      <>
                        <span className={styles.tabLong}>{tab.label}</span>
                        <span className={styles.tabShort} aria-hidden>
                          {tab.short}
                        </span>
                      </>
                    ) : (
                      tab.label
                    )}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      )}

      <main className={styles.content}>
        <Outlet />
        {/* The room the phone's bar takes, given back. */}
        {!backTo && <BottomTabsSpacer />}
      </main>

      {/* A drill-in (one quote, one event) is a full screen with its own back
          arrow and actions, as in a native app — the tab bar steps aside. */}
      {!backTo && <BottomTabs items={bottomTabs} ariaLabel="Organizer" />}
    </div>
  );
}
