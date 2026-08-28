import { useState } from 'react';
import { useAuth } from '@app/auth';
import { useGetAccountDetailsQuery, useUpdateAccountDetailsMutation } from '../service';
import {
  useGetMySubVendorProfileQuery,
  useUpdateMySubVendorProfileMutation,
} from '@features/subvendor/profile/service';
import type { AccountDetails, AccountEdits, AccountFieldErrors } from '../types';

const blank: AccountEdits = { name: '', email: '', city: '' };

function editsFrom(account: AccountDetails | undefined): AccountEdits {
  if (!account) return blank;
  return { name: account.name ?? '', email: account.email ?? '', city: account.city ?? '' };
}

/** Mirrors UpdateProfileDto so the client never sends what the server refuses. */
function validate(edits: AccountEdits): AccountFieldErrors {
  const errors: AccountFieldErrors = {};
  const name = edits.name.trim();
  if (name.length < 2) errors.name = 'Enter your name';
  else if (name.length > 80) errors.name = 'Keep it under 80 characters';

  // Email is optional on the account, but a malformed one is worth catching.
  const email = edits.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address';
  }

  if (edits.city.trim().length > 120) errors.city = 'Keep it under 120 characters';
  return errors;
}

export function useSubvendorSettings() {
  const { signOut } = useAuth();
  const accountQuery = useGetAccountDetailsQuery();
  const profileQuery = useGetMySubVendorProfileQuery();
  const [updateAccount, accountState] = useUpdateAccountDetailsMutation();
  const [updateProfile, profileState] = useUpdateMySubVendorProfileMutation();

  const account = accountQuery.data;
  const profile = profileQuery.data;

  const [editing, setEditing] = useState(false);
  const [edits, setEdits] = useState<AccountEdits>(blank);
  const [errors, setErrors] = useState<AccountFieldErrors>({});
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const startEditing = () => {
    setEdits(editsFrom(account));
    setErrors({});
    setSaveError(null);
    setSaved(false);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setErrors({});
    setSaveError(null);
  };

  const setEdit = <K extends keyof AccountEdits>(key: K, value: AccountEdits[K]) => {
    setEdits((e) => ({ ...e, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const save = () => {
    const found = validate(edits);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setSaveError(null);
    const email = edits.email.trim();
    updateAccount({
      name: edits.name.trim(),
      city: edits.city.trim(),
      // Only sent when there is one — the API treats an empty string as a
      // value, and blanking an email is not what an empty field means here.
      ...(email ? { email } : {}),
    })
      .unwrap()
      .then(() => {
        setEditing(false);
        setSaved(true);
      })
      .catch((err: { message?: string } | undefined) => {
        setSaveError(err?.message?.trim() || 'We couldn’t save your changes. Please try again.');
      });
  };

  const setAvailability = (active: boolean) => {
    setSaveError(null);
    setSaved(false);
    updateProfile({ active })
      .unwrap()
      .catch((err: { message?: string } | undefined) => {
        setSaveError(err?.message?.trim() || 'We couldn’t update your availability.');
      });
  };

  return {
    account,
    profile,
    isLoading: accountQuery.isLoading || profileQuery.isLoading,
    isError: accountQuery.isError,
    refetch: () => {
      void accountQuery.refetch();
      void profileQuery.refetch();
    },
    editing,
    edits,
    errors,
    saved,
    saveError,
    isSaving: accountState.isLoading || profileState.isLoading,
    startEditing,
    cancelEditing,
    setEdit,
    save,
    setAvailability,
    signOut,
  };
}
