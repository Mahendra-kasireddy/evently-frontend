import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type NormalizedApiError } from '@lib/api';
import { SUBVENDOR_STEPS, VENDOR_CATEGORIES, type SubvendorStep } from '../constants';
import { useFinishSubvendorOnboardingMutation } from '../service';
import type { SubvendorDraft } from '../types';

const INITIAL: SubvendorDraft = {
  fullName: '',
  categoryId: 'water',
  serviceArea: '',
  baseRate: '',
  minOrder: '',
  organizerPhone: '',
};

export interface UseSubvendorResult {
  step: SubvendorStep;
  stepIndex: number;
  draft: SubvendorDraft;
  unit: string;
  setField: <K extends keyof SubvendorDraft>(key: K, value: SubvendorDraft[K]) => void;
  next: () => void;
  back: () => void;
  finish: () => void;
  isFinishing: boolean;
  finishError: NormalizedApiError | null;
}

export function useSubvendorOnboarding(): UseSubvendorResult {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<SubvendorDraft>(INITIAL);

  const step = SUBVENDOR_STEPS[stepIndex] ?? 'details';
  const unit = useMemo(
    () => VENDOR_CATEGORIES.find((c) => c.id === draft.categoryId)?.unit ?? 'unit',
    [draft.categoryId],
  );

  const setField: UseSubvendorResult['setField'] = (key, value) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const [finishOnboarding, finishState] = useFinishSubvendorOnboardingMutation();

  const next = () => setStepIndex((i) => Math.min(i + 1, SUBVENDOR_STEPS.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));
  const finish = () => {
    finishOnboarding(draft)
      .unwrap()
      .then(() => navigate('/'))
      .catch(() => {
        /* finishState.error drives the UI */
      });
  };

  return {
    step,
    stepIndex,
    draft,
    unit,
    setField,
    next,
    back,
    finish,
    isFinishing: finishState.isLoading,
    finishError: (finishState.error as NormalizedApiError | undefined) ?? null,
  };
}
