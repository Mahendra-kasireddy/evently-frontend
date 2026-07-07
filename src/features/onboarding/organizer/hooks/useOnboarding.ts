import { useMemo, useState } from 'react';
import { type NormalizedApiError } from '@lib/api';
import { ONBOARDING_STEPS } from '../constants';
import { useSaveBasicInfoMutation } from '../service';
import {
  basicInfoSchema,
  type BasicInfoFieldErrors,
  type BasicInfoValues,
  type OnboardingStep,
} from '../types';

interface UseOnboardingResult {
  steps: OnboardingStep[];
  currentId: string;
  goToStep: (id: string) => void;
  submitBasicInfo: (values: BasicInfoValues) => void;
  isSaving: boolean;
  fieldErrors: BasicInfoFieldErrors;
  error: NormalizedApiError | null;
}

export function useOnboarding(): UseOnboardingResult {
  const [currentId, setCurrentId] = useState<string>('basic');
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<BasicInfoFieldErrors>({});

  const steps = useMemo<OnboardingStep[]>(
    () =>
      ONBOARDING_STEPS.map((s) => ({
        id: s.id,
        order: s.order,
        title: s.title,
        status: completed.has(s.id) ? 'completed' : s.id === currentId ? 'current' : 'pending',
      })),
    [completed, currentId],
  );

  const [saveBasicInfo, saveState] = useSaveBasicInfoMutation();

  const submitBasicInfo = (values: BasicInfoValues): void => {
    const parsed = basicInfoSchema.safeParse(values);
    if (!parsed.success) {
      const next: BasicInfoFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof BasicInfoValues | undefined;
        if (key && !next[key]) next[key] = issue.message;
      }
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});
    saveBasicInfo(parsed.data)
      .unwrap()
      .then(() => {
        setCompleted((prev) => new Set(prev).add('basic'));
        setCurrentId('verification');
      })
      .catch(() => {
        /* saveState.error drives the UI */
      });
  };

  return {
    steps,
    currentId,
    goToStep: setCurrentId,
    submitBasicInfo,
    isSaving: saveState.isLoading,
    fieldErrors,
    error: (saveState.error as NormalizedApiError | undefined) ?? null,
  };
}
