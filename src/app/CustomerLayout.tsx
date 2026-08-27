import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppHeader, Footer, Header, type AppNavItem } from '@shared/components';
import { useGetProfileSummaryQuery } from '@features/customer/home/profile.service';
import {
  useGetUnreadCountQuery,
  useGetMyNotificationsQuery,
  useMarkAllNotificationsReadMutation,
} from '@features/customer/home/notifications.service';
import { rememberCity } from '@shared/components';
import {
  useGetCityOptionsQuery,
  useSaveProfileBasicsMutation,
} from '@features/auth/welcome/service';
import { useAuth } from './auth';
import { prefetchRoute, warmRoutes } from './prefetch';

/** Primary customer nav (app chrome). Active item derived from the URL. */
const NAV: AppNavItem[] = [
  { label: 'Home', to: '/home' },
  { label: 'Plan event', to: '/plan' },
  { label: 'Discover', to: '/discover' },
  { label: 'My events', to: '/workspace' },
];

/**
 * Routes that belong to a nav section but do not live under its path. Checkout,
 * the payment receipt and the booking detail are all reached from My Events and
 * are part of that journey, so the tab has to stay lit while the customer is on
 * them — otherwise the chrome says they have left a section they are still in.
 */
const NAV_ALIASES: Record<string, string[]> = {
  '/workspace': ['/booking', '/booking-details', '/payment-success', '/quotes', '/quote', '/my-invitation'],
};

/** True when `pathname` is this nav item's own path or one of its aliases. */
function isNavActive(pathname: string, to: string): boolean {
  const inSection = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  return inSection(to) || (NAV_ALIASES[to] ?? []).some(inSection);
}

/**
 * Persistent shell for authenticated customer screens. The header + footer
 * mount once here; only the routed <Outlet/> content changes on navigation —
 * so clicking a nav item swaps the content without re-rendering the whole page.
 */
export function CustomerLayout() {
  const { pathname } = useLocation();

  /*
   * Download the four nav destinations once the browser is idle. Each feature
   * is its own chunk, so without this the first click on Plan event or Discover
   * has to fetch JS before it can render anything — which looked like the whole
   * page reloading. By the time anyone clicks, the chunk is already there.
   */
  useEffect(() => warmRoutes(NAV.map((item) => item.to)), []);
  const navigate = useNavigate();
  const { status, user: sessionUser, signOut } = useAuth();
  // Screens in this shell are open to anonymous visitors (the planner, a public
  // organizer profile, Discover). Their account-scoped queries are skipped
  // rather than fired and 401'd, and the signed-out chrome is shown — a profile
  // menu and "My events" for someone with no session reads as a bug.
  const isAuthed = status === 'authenticated';
  const { data: profile } = useGetProfileSummaryQuery(undefined, { skip: !isAuthed });
  const { data: unread = 0 } = useGetUnreadCountQuery(undefined, { skip: !isAuthed });
  const { data: notifications = [] } = useGetMyNotificationsQuery(undefined, { skip: !isAuthed });
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  // Location strip: real city options, persisted on the profile. Saving
  // invalidates `Profile` + `CustomerHome`, which is what re-resolves the
  // location-dependent Home sections for the newly chosen city.
  const { data: cityOptions = [], isLoading: citiesLoading } = useGetCityOptionsQuery(undefined, {
    skip: !isAuthed,
  });
  const [saveCity, saveCityState] = useSaveProfileBasicsMutation();
  const selectCity = (city: string) => {
    saveCity({ city })
      .unwrap()
      .then(() => rememberCity(city))
      .catch(() => {
        /* the header keeps the previous city; nothing to undo */
      });
  };

  const nav = NAV.map((item) => ({ ...item, active: isNavActive(pathname, item.to) }));
  const user = {
    initials: profile?.initials ?? 'U',
    location: profile?.location ?? '',
    name: profile?.name ?? sessionUser?.name ?? 'Your account',
    email: sessionUser?.email ?? '',
    role: 'Customer',
  };

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <>
      {isAuthed ? (
        <AppHeader
          nav={nav}
          user={user}
          // Hover or keyboard focus starts the download before the click.
          onNavIntent={prefetchRoute}
          cityOptions={cityOptions}
          citiesLoading={citiesLoading}
          onSelectCity={selectCity}
          isSavingCity={saveCityState.isLoading}
          notifications={notifications}
          hasNotifications={unread > 0}
          onSignOut={handleSignOut}
          onMarkAllRead={() => void markAllRead()}
        />
      ) : (
        <Header />
      )}
      <Outlet />
      <Footer />
    </>
  );
}
