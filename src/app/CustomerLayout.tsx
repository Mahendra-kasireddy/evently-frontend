import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppHeader, Footer, type AppNavItem } from '@shared/components';
import { useGetProfileSummaryQuery } from '@features/customer/home/profile.service';
import {
  useGetUnreadCountQuery,
  useGetMyNotificationsQuery,
  useMarkAllNotificationsReadMutation,
} from '@features/customer/home/notifications.service';
import { useAuth } from './auth';

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
  const navigate = useNavigate();
  const { user: sessionUser, signOut } = useAuth();
  const { data: profile } = useGetProfileSummaryQuery();
  const { data: unread = 0 } = useGetUnreadCountQuery();
  const { data: notifications = [] } = useGetMyNotificationsQuery();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const nav = NAV.map((item) => ({ ...item, active: pathname.startsWith(item.to) }));
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
      <AppHeader
        nav={nav}
        user={user}
        notifications={notifications}
        hasNotifications={unread > 0}
        onSignOut={handleSignOut}
        onMarkAllRead={() => void markAllRead()}
      />
      <Outlet />
      <Footer />
    </>
  );
}
