import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, type NormalizedApiError } from '@lib/api';
import { postToApp } from '@lib/native';

/** The sides of the product an account can open on. */
export type DefaultRole = 'customer' | 'organizer' | 'vendor';

const DEFAULT_ROLE_ENDPOINT = '/user/default-role';

const HOME_FOR: Record<DefaultRole, string> = {
  customer: '/home',
  organizer: '/organizer/home',
  vendor: '/subvendor/home',
};

/**
 * Moves the account to another side of the product and makes it the default,
 * so the next sign-in — on any device — opens there too.
 *
 * Inside the mobile app the customer side is native, not a page here, so the
 * app is told to take over; in a browser it is an ordinary navigation.
 */
export function useSwitchRole() {
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchTo = useCallback(
    (role: DefaultRole) => {
      setSwitching(true);
      setError(null);
      apiClient
        .patch(DEFAULT_ROLE_ENDPOINT, { role })
        .then(() => {
          if (!postToApp({ type: 'switchRole', role })) navigate(HOME_FOR[role]);
        })
        .catch((e: NormalizedApiError) => setError(e?.message ?? 'Could not switch right now'))
        .finally(() => setSwitching(false));
    },
    [navigate],
  );

  return { switchTo, switching, error };
}

/** Where an account lands after sign-in: its default side, if it still holds that role. */
export function homePathFor(defaultRole: string | undefined, roles: readonly string[]): string {
  if (defaultRole === 'organizer' && roles.includes('organizer')) return HOME_FOR.organizer;
  if (defaultRole === 'vendor' && roles.includes('vendor')) return HOME_FOR.vendor;
  return HOME_FOR.customer;
}
