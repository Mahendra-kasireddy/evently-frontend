import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { readRecentCities, rememberCity } from '@shared/components';
import { useGetProfileSummaryQuery } from '@features/customer/home/profile.service';
import { WELCOME_COPY as COPY } from '../constants';
import { useGetCityOptionsQuery, useSaveProfileBasicsMutation } from '../service';

export interface UseWelcomeResult {
  step: 1 | 2;
  ready: boolean;
  name: string;
  setName: (v: string) => void;
  nameError: string | undefined;
  submitName: () => void;
  cities: string[];
  citiesLoading: boolean;
  recent: string[];
  city: string | undefined;
  selectCity: (city: string) => void;
  skipCity: () => void;
  isSaving: boolean;
  error: string | undefined;
}

/**
 * Two-step onboarding after OTP: preferred name, then city. Each step persists
 * on its own via the existing profile endpoint, so a customer who drops off
 * mid-way keeps what they already gave us and resumes at the step they left.
 */
export function useWelcome(): UseWelcomeResult {
  const navigate = useNavigate();
  const profileQ = useGetProfileSummaryQuery();
  const citiesQ = useGetCityOptionsQuery();
  const [save, saveState] = useSaveProfileBasicsMutation();

  const profile = profileQ.data;
  const savedName = profile?.name && profile.name !== 'there' ? profile.name : '';
  const savedCity = profile?.location ?? '';

  const [name, setName] = useState('');
  const [nameDone, setNameDone] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Resume at whichever step is still unanswered.
  const step: 1 | 2 = savedName || nameDone ? 2 : 1;
  const value = name || savedName;
  const nameError = value.trim().length >= 2 ? undefined : COPY.nameTooShort;

  const submitName = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed.length < 2) return;
    setError(undefined);
    save({ name: trimmed })
      .unwrap()
      .then(() => setNameDone(true))
      .catch(() => setError(COPY.failed));
  }, [save, value]);

  const selectCity = useCallback(
    (city: string) => {
      setError(undefined);
      save({ city })
        .unwrap()
        .then(() => {
          rememberCity(city);
          navigate('/home', { replace: true });
        })
        .catch(() => setError(COPY.failed));
    },
    [navigate, save],
  );

  // Skipping is allowed — a missing city must never trap someone on this screen.
  const skipCity = useCallback(() => navigate('/home', { replace: true }), [navigate]);

  const recent = useMemo(() => readRecentCities(), []);

  return {
    step,
    ready: !profileQ.isLoading,
    name: value,
    setName,
    nameError,
    submitName,
    cities: citiesQ.data ?? [],
    citiesLoading: citiesQ.isLoading,
    recent,
    city: savedCity || undefined,
    selectCity,
    skipCity,
    isSaving: saveState.isLoading,
    error,
  };
}
