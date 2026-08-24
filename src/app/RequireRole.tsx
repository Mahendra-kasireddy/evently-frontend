import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, type Role } from './auth';

interface RequireRoleProps {
  allowed: Role[];
}

/**
 * Route guard for role-gated areas (e.g. the organizer dashboard). Redirects
 * unauthenticated visitors to /login (preserving the attempted location, same
 * as a route guard), and authenticated-but-wrong-role visitors to /home.
 */
export function RequireRole({ allowed }: RequireRoleProps) {
  const { status, roles } = useAuth();
  const location = useLocation();

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!roles.some((role) => allowed.includes(role))) {
    return <Navigate to="/home" replace />;
  }
  return <Outlet />;
}
