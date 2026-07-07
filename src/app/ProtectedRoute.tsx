import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth';

/**
 * Route guard for authenticated areas. Redirects to /login and preserves the
 * attempted location so the login flow can return the user afterward.
 */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
