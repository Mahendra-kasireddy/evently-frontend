import { useState } from 'react';
import { useGetMySubVendorProfileQuery, useUpdateMySubVendorProfileMutation } from '../service';
import { useGetMyOrganizersQuery } from '@features/subvendor/payments/service';
import type { ProfileEdits, ProfileFieldErrors, SubVendorProfile } from '../types';

const blank: ProfileEdits = { serviceArea: '', baseRate: '', minOrder: '' };

function editsFrom(profile: SubVendorProfile | undefined): ProfileEdits {
  if (!profile) return blank;
  return {
    serviceArea: profile.serviceArea ?? '',
    baseRate: profile.baseRate ? String(profile.baseRate) : '',
    minOrder: profile.minOrder ? String(profile.minOrder) : '',
  };
}

/** Mirrors UpdateSubVendorProfileDto, so the client never sends a refusal. */
function validate(edits: ProfileEdits): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};
  if (edits.serviceArea.length > 120) errors.serviceArea = 'Keep it under 120 characters';
  if (edits.baseRate && Number(edits.baseRate) > 10_000_000) {
    errors.baseRate = 'That rate looks too high — check the figure';
  }
  if (edits.minOrder && Number(edits.minOrder) > 1_000_000) {
    errors.minOrder = 'That looks too high — check the figure';
  }
  return errors;
}

export function useSubvendorProfile() {
  const profileQuery = useGetMySubVendorProfileQuery();
  const orgsQuery = useGetMyOrganizersQuery();
  const [update, updateState] = useUpdateMySubVendorProfileMutation();

  const profile = profileQuery.data;

  const [editing, setEditing] = useState(false);
  const [edits, setEdits] = useState<ProfileEdits>(blank);
  const [errors, setErrors] = useState<ProfileFieldErrors>({});
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const startEditing = () => {
    setEdits(editsFrom(profile));
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

  const setEdit = <K extends keyof ProfileEdits>(key: K, value: ProfileEdits[K]) => {
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
    update({
      serviceArea: edits.serviceArea.trim(),
      // An empty field means "no rate set", which the API stores as 0 —
      // distinct from leaving the field untouched.
      baseRate: edits.baseRate ? Number(edits.baseRate) : 0,
      minOrder: edits.minOrder ? Number(edits.minOrder) : 0,
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

  /**
   * Availability is a single switch, saved immediately rather than behind the
   * edit form — a vendor flipping it is usually doing so in a hurry because
   * they've just been booked up or gone away.
   */
  const setAvailability = (active: boolean) => {
    setSaveError(null);
    setSaved(false);
    update({ active })
      .unwrap()
      .catch((err: { message?: string } | undefined) => {
        setSaveError(err?.message?.trim() || 'We couldn’t update your availability.');
      });
  };

  return {
    profile,
    organizers: orgsQuery.data ?? [],
    isLoading: profileQuery.isLoading || orgsQuery.isLoading,
    isError: profileQuery.isError || orgsQuery.isError,
    refetch: () => {
      void profileQuery.refetch();
      void orgsQuery.refetch();
    },
    editing,
    edits,
    errors,
    saved,
    saveError,
    isSaving: updateState.isLoading,
    startEditing,
    cancelEditing,
    setEdit,
    save,
    setAvailability,
  };
}
