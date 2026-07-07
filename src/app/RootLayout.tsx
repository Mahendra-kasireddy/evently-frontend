import { Link, Outlet } from 'react-router-dom';
import { env } from '@lib/env';
import { useAuth } from './auth';

/** App chrome shared across routes. Pure layout — no business logic. */
export function RootLayout() {
  const { status, user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <Link to="/" className="text-base font-semibold">
          {env.appName}
        </Link>
        {status === 'authenticated' ? (
          <div className="flex items-center gap-3 text-sm">
            {user && <span className="text-gray-600">{user.email}</span>}
            <button
              type="button"
              onClick={signOut}
              className="rounded-md border border-gray-300 px-3 py-1.5 font-medium hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Sign in
          </Link>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
