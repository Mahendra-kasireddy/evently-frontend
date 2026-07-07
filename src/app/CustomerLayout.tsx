import { Outlet, useLocation } from 'react-router-dom';
import { AppHeader, Footer, type AppNavItem } from '@shared/components';
import { useGetProfileSummaryQuery } from '@features/customer/home/profile.service';
import { useGetUnreadCountQuery } from '@features/customer/home/notifications.service';

/** Primary customer nav (app chrome). Active item derived from the URL. */
const NAV: AppNavItem[] = [
  { label: 'Home', to: '/home' },
  { label: 'Plan event', to: '/plan' },
  { label: 'Discover', to: '/discover' },
  { label: 'My events', to: '/workspace' },
];

/**
 * Persistent shell for authenticated customer screens. The header + footer
 * mount once here; only the routed <Outlet/> content changes on navigation —
 * so clicking a nav item swaps the content without re-rendering the whole page.
 */
export function CustomerLayout() {
  const { pathname } = useLocation();
  const { data: profile } = useGetProfileSummaryQuery();
  const { data: unread = 0 } = useGetUnreadCountQuery();

  const nav = NAV.map((item) => ({ ...item, active: pathname.startsWith(item.to) }));
  const user = { initials: profile?.initials ?? 'U', location: profile?.location ?? '' };

  return (
    <>
      <AppHeader nav={nav} user={user} hasNotifications={unread > 0} />
      <Outlet />
      <Footer />
    </>
  );
}
