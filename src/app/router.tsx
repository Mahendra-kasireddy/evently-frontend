/* eslint-disable react-refresh/only-export-components --
   Route-config module: it exports the `router` object (not a component)
   alongside locally-defined lazy pages. Fast Refresh does not apply here. */
import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazyRoute } from './lazyRoute';
import { CustomerLayout } from './CustomerLayout';

/**
 * Top-level features are code-split. Both the landing and login are full-bleed
 * (their own chrome), so neither uses RootLayout. RootLayout/ProtectedRoute
 * remain available for future authenticated, app-chrome routes.
 */
const LandingPage = lazy(() => import('@features/auth/landing/page'));
const LoginPage = lazy(() => import('@features/auth/login/page'));
const JoinPage = lazy(() => import('@features/auth/join/page'));
const OrganizerOnboardingPage = lazy(() => import('@features/onboarding/organizer/page'));
const SubvendorOnboardingPage = lazy(() => import('@features/onboarding/subvendor/page'));
const CustomerHomePage = lazy(() => import('@features/customer/home/page'));
const PlanPage = lazy(() => import('@features/customer/plan/page'));
const OrganizerProfilePage = lazy(() => import('@features/customer/organizer-profile/page'));
const QuotesPage = lazy(() => import('@features/customer/quotes/page'));
const QuoteDetailPage = lazy(() => import('@features/customer/quote-detail/page'));
const BookingPage = lazy(() => import('@features/customer/booking/page'));
const BookingDetailPage = lazy(() => import('@features/customer/booking-detail/page'));
const WorkspacePage = lazy(() => import('@features/customer/workspace/page'));
const PaymentSuccessPage = lazy(() => import('@features/customer/payment-success/page'));
const DiscoverPage = lazy(() => import('@features/customer/discover/page'));

export const router = createBrowserRouter([
  { path: '/', element: lazyRoute(LandingPage, 'landing') },
  { path: '/login', element: lazyRoute(LoginPage, 'login') },
  { path: '/join', element: lazyRoute(JoinPage, 'join') },
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
      { path: '/quotes', element: lazyRoute(QuotesPage, 'quotes') },
      { path: '/quote/:id', element: lazyRoute(QuoteDetailPage, 'quote-detail') },
      { path: '/booking/:quotationId', element: lazyRoute(BookingPage, 'booking') },
      { path: '/booking-details/:id', element: lazyRoute(BookingDetailPage, 'booking-detail') },
      { path: '/workspace', element: lazyRoute(WorkspacePage, 'workspace') },
      { path: '/payment-success/:id', element: lazyRoute(PaymentSuccessPage, 'payment-success') },
      { path: '/discover', element: lazyRoute(DiscoverPage, 'discover') },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
]);
