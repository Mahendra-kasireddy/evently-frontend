/* eslint-disable react-refresh/only-export-components --
   Route-config module: it exports the `router` object (not a component)
   alongside locally-defined lazy pages. Fast Refresh does not apply here. */
import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazyRoute } from './lazyRoute';
import { CustomerLayout } from './CustomerLayout';
import { OrganizerLayout } from './OrganizerLayout';
import { SubVendorLayout } from './SubVendorLayout';
import { RequireRole } from './RequireRole';

/**
 * Top-level features are code-split. The landing and login pages are full-bleed
 * and carry their own chrome; the authenticated sections each have a layout
 * shell below (CustomerLayout / OrganizerLayout / SubVendorLayout), and role
 * gating is done by RequireRole.
 */
const LandingPage = lazy(() => import('@features/auth/landing/page'));
const LoginPage = lazy(() => import('@features/auth/login/page'));
const JoinPage = lazy(() => import('@features/auth/join/page'));
const WelcomePage = lazy(() => import('@features/auth/welcome/page'));
const OrganizerOnboardingPage = lazy(() => import('@features/onboarding/organizer/page'));
const SubvendorOnboardingPage = lazy(() => import('@features/onboarding/subvendor/page'));
const CustomerHomePage = lazy(() => import('@features/customer/home/page'));
const PlanPage = lazy(() => import('@features/customer/plan/page'));
const OrganizerProfilePage = lazy(() => import('@features/customer/organizer-profile/page'));
const BookedWorkspacePage = lazy(() => import('@features/customer/workspace/booked/page'));
const IdeasPage = lazy(() => import('@features/customer/workspace/ideas/page'));
const WorkspaceEventPage = lazy(() => import('@features/customer/workspace/event/page'));
const WorkspaceResponsePage = lazy(() => import('@features/customer/workspace/response/page'));
// The old flat quote routes survive only as redirects into My Events (below).
const LegacyQuotesPage = lazy(() => import('@features/customer/workspace/legacy/page'));
const LegacyQuoteDetailPage = lazy(() =>
  import('@features/customer/workspace/legacy/page').then((m) => ({
    default: m.LegacyQuoteDetailPage,
  })),
);
const BookingPage = lazy(() => import('@features/customer/booking/page'));
const BookingDetailPage = lazy(() => import('@features/customer/booking-detail/page'));
const WorkspacePage = lazy(() => import('@features/customer/workspace/page'));
const PaymentSuccessPage = lazy(() => import('@features/customer/payment-success/page'));
const DiscoverPage = lazy(() => import('@features/customer/discover/page'));
const ProfilePage = lazy(() => import('@features/customer/profile/page'));
const SettingsPage = lazy(() => import('@features/customer/settings/page'));
const WorkspaceInvitationPage = lazy(
  () => import('@features/customer/workspace/invitation/page'),
);
const MyInvitationPage = lazy(() => import('@features/customer/my-invitation/page'));
const OrganizerHomePage = lazy(() => import('@features/organizer/home/page'));
const OrganizerQuotesPage = lazy(() => import('@features/organizer/quotes/page'));
const OrganizerRespondPage = lazy(() => import('@features/organizer/quote-respond/page'));
const OrganizerQuoteBuilderPage = lazy(() => import('@features/organizer/quote-builder/page'));
const OrganizerEventsPage = lazy(() => import('@features/organizer/events/page'));
const OrganizerEventDetailPage = lazy(() => import('@features/organizer/event-detail/page'));
const OrganizerIdeasPage = lazy(() => import('@features/organizer/ideas/page'));
const OrganizerInvitationPage = lazy(() => import('@features/organizer/invitation/page'));
const OrganizerCalendarPage = lazy(() => import('@features/organizer/calendar/page'));
const OrganizerOwnProfilePage = lazy(() => import('@features/organizer/profile/page'));
const OrganizerSubvendorsPage = lazy(() => import('@features/organizer/subvendors/page'));
const OrganizerEarningsPage = lazy(() => import('@features/organizer/earnings/page'));
const OrganizerBadgesPage = lazy(() => import('@features/organizer/badges/page'));
const OrganizerAcademyPage = lazy(() => import('@features/organizer/academy/page'));
const SubvendorHomePage = lazy(() => import('@features/subvendor/home/page'));
const SubvendorTaskDetailPage = lazy(() => import('@features/subvendor/task-detail/page'));
const SubvendorPaymentsPage = lazy(() => import('@features/subvendor/payments/page'));
const SubvendorProfilePage = lazy(() => import('@features/subvendor/profile/page'));

export const router = createBrowserRouter([
  { path: '/', element: lazyRoute(LandingPage, 'landing') },
  { path: '/login', element: lazyRoute(LoginPage, 'login') },
  { path: '/join', element: lazyRoute(JoinPage, 'join') },
  { path: '/welcome', element: lazyRoute(WelcomePage, 'welcome') },
  { path: '/onboarding/organizer', element: lazyRoute(OrganizerOnboardingPage, 'onboarding') },
  { path: '/onboarding/subvendor', element: lazyRoute(SubvendorOnboardingPage, 'onboarding') },

  // Authenticated customer screens share one persistent shell (header + footer).
  // Only the <Outlet/> content changes on navigation — no full-page re-render.
  {
    element: <CustomerLayout />,
    children: [
      { path: '/home', element: lazyRoute(CustomerHomePage, 'home') },
      { path: '/plan', element: lazyRoute(PlanPage, 'plan') },
      { path: '/organizer/:id', element: lazyRoute(OrganizerProfilePage, 'organizer-profile') },
      // Superseded by the nested My Events routes; redirect only, no duplicate UI.
      { path: '/quotes', element: lazyRoute(LegacyQuotesPage, 'quotes-redirect') },
      { path: '/quote/:id', element: lazyRoute(LegacyQuoteDetailPage, 'quote-redirect') },
      { path: '/booking/:quotationId', element: lazyRoute(BookingPage, 'booking') },
      { path: '/booking-details/:id', element: lazyRoute(BookingDetailPage, 'booking-detail') },

      /*
       * My Events, three levels deep under one prefix. CustomerLayout marks the
       * nav item active with `pathname.startsWith('/workspace')`, so the customer
       * stays visibly inside this section for the whole
       * request → response → comparison → review journey.
       */
      { path: '/workspace', element: lazyRoute(WorkspacePage, 'workspace') },
      // Static segment first: it must win over `:requestId` below.
      {
        path: '/workspace/booked/:bookingId',
        element: lazyRoute(BookedWorkspacePage, 'workspace-booked'),
      },
      {
        path: '/workspace/booked/:bookingId/ideas',
        element: lazyRoute(IdeasPage, 'workspace-ideas'),
      },
      {
        path: '/workspace/booked/:bookingId/invitation',
        element: lazyRoute(WorkspaceInvitationPage, 'workspace-invitation'),
      },
      { path: '/workspace/:requestId', element: lazyRoute(WorkspaceEventPage, 'workspace-event') },
      {
        path: '/workspace/:requestId/:quotationId',
        element: lazyRoute(WorkspaceResponsePage, 'workspace-response'),
      },
      { path: '/payment-success/:id', element: lazyRoute(PaymentSuccessPage, 'payment-success') },
      { path: '/discover', element: lazyRoute(DiscoverPage, 'discover') },
      { path: '/profile', element: lazyRoute(ProfilePage, 'profile') },
      { path: '/settings', element: lazyRoute(SettingsPage, 'settings') },
      // Kept as an entry point only: the invitation itself lives under the
      // booking it belongs to, so this resolves which one and forwards there.
      { path: '/my-invitation', element: lazyRoute(MyInvitationPage, 'my-invitation') },
    ],
  },

  // Organizer-only screens: role-gated (customer/admin roles + logged-out
  // visitors are redirected), sharing their own persistent shell.
  {
    element: <RequireRole allowed={['organizer', 'admin']} />,
    children: [
      {
        element: <OrganizerLayout />,
        children: [
          { path: '/organizer/home', element: lazyRoute(OrganizerHomePage, 'organizer-home') },
          { path: '/organizer/quotes', element: lazyRoute(OrganizerQuotesPage, 'organizer-quotes') },
          {
            path: '/organizer/quote-builder',
            element: lazyRoute(OrganizerQuoteBuilderPage, 'organizer-quote-builder'),
          },
          {
            path: '/organizer/respond/:requestId',
            element: lazyRoute(OrganizerRespondPage, 'organizer-respond'),
          },
          { path: '/organizer/events', element: lazyRoute(OrganizerEventsPage, 'organizer-events') },
          {
            path: '/organizer/events/:bookingId',
            element: lazyRoute(OrganizerEventDetailPage, 'organizer-event-detail'),
          },
          {
            path: '/organizer/events/:bookingId/ideas',
            element: lazyRoute(OrganizerIdeasPage, 'organizer-ideas'),
          },
          {
            path: '/organizer/invitation/:bookingId',
            element: lazyRoute(OrganizerInvitationPage, 'organizer-invitation'),
          },
          { path: '/organizer/calendar', element: lazyRoute(OrganizerCalendarPage, 'organizer-calendar') },
          { path: '/organizer/subvendors', element: lazyRoute(OrganizerSubvendorsPage, 'organizer-subvendors') },
          { path: '/organizer/earnings', element: lazyRoute(OrganizerEarningsPage, 'organizer-earnings') },
          { path: '/organizer/badges', element: lazyRoute(OrganizerBadgesPage, 'organizer-badges') },
          { path: '/organizer/academy', element: lazyRoute(OrganizerAcademyPage, 'organizer-academy') },
          { path: '/organizer/profile', element: lazyRoute(OrganizerOwnProfilePage, 'organizer-own-profile') },
        ],
      },
    ],
  },

  // Sub-vendor-only screens: role-gated, sharing their own persistent shell.
  {
    element: <RequireRole allowed={['vendor', 'admin']} />,
    children: [
      {
        element: <SubVendorLayout />,
        children: [
          { path: '/subvendor/home', element: lazyRoute(SubvendorHomePage, 'subvendor-home') },
          {
            path: '/subvendor/tasks/:bookingId/:taskId',
            element: lazyRoute(SubvendorTaskDetailPage, 'subvendor-task-detail'),
          },
          { path: '/subvendor/payments', element: lazyRoute(SubvendorPaymentsPage, 'subvendor-payments') },
          { path: '/subvendor/profile', element: lazyRoute(SubvendorProfilePage, 'subvendor-profile') },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
]);
