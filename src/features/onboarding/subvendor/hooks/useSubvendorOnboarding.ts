import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken, type NormalizedApiError } from '@lib/api';
import { useAuth } from '@app/auth';
import {
  OTHER_CATEGORY_ID,
  SUBVENDOR_STEPS,
  VENDOR_CATEGORIES,
  type SubvendorStep,
} from '../constants';
import { useFinishSubvendorOnboardingMutation } from '../service';
import type { SubvendorDraft, SubvendorFieldErrors } from '../types';

/*
 * No category is preselected. It used to default to 'water', so a vendor who
 * skipped past the step — which nothing stopped them doing — was registered as
 * a water supplier and priced per bottle.
 */
const INITIAL: SubvendorDraft = {
  fullName: '',
  categoryId: '',
  customCategory: '',
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
  errors: SubvendorFieldErrors;
  setField: <K extends keyof SubvendorDraft>(key: K, value: SubvendorDraft[K]) => void;
  next: () => void;
  back: () => void;
  finish: () => void;
  isFinishing: boolean;
  finishError: NormalizedApiError | null;
}

/**
 * Per-step validation.
 *
 * The wizard had none: `next()` just incremented the index, so someone could
 * click through all three screens blank and only find out at the end, when the
 * API rejected the submission with no field to point at. These rules mirror
 * `OnboardSubvendorDto` so the client never accepts what the server will
 * refuse — the server is still what enforces it.
 */
function validate(step: SubvendorStep, draft: SubvendorDraft): SubvendorFieldErrors {
  const errors: SubvendorFieldErrors = {};

  if (step === 'details') {
    if (draft.fullName.trim().length < 2) errors.fullName = 'Enter your name';
    if (!draft.categoryId) errors.categoryId = 'Pick what you do';
    if (draft.categoryId === OTHER_CATEGORY_ID) {
      const custom = draft.customCategory.trim();
      if (custom.length < 2) errors.customCategory = 'Tell us what you do, in a couple of words';
      else if (custom.length > 60) errors.customCategory = 'Keep it under 60 characters';
    }
  }

  if (step === 'rate' && draft.baseRate && Number(draft.baseRate) <= 0) {
    errors.baseRate = 'Enter a rate above zero, or leave it blank for now';
  }

  // The organizer phone is optional — a vendor can join without an invite —
  // but a half-typed number is a mistake worth catching.
  if (step === 'link') {
    const phone = draft.organizerPhone.replace(/\D/g, '');
    if (phone && phone.length !== 10) errors.organizerPhone = 'Enter a valid 10-digit number';
  }

  return errors;
}

export function useSubvendorOnboarding(): UseSubvendorResult {
  const navigate = useNavigate();
  const { refreshRolesFromToken } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<SubvendorDraft>(INITIAL);
  const [errors, setErrors] = useState<SubvendorFieldErrors>({});

  const step = SUBVENDOR_STEPS[stepIndex] ?? 'details';
  const unit = useMemo(
    () => VENDOR_CATEGORIES.find((c) => c.id === draft.categoryId)?.unit ?? 'unit',
    [draft.categoryId],
  );

  const setField: UseSubvendorResult['setField'] = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    // Clear the field's error the moment it's touched; re-checked on continue.
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const [finishOnboarding, finishState] = useFinishSubvendorOnboardingMutation();

  const next = () => {
    const found = validate(step, draft);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});
    setStepIndex((i) => Math.min(i + 1, SUBVENDOR_STEPS.length - 1));
  };

  const back = () => {
    setErrors({});
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const finish = () => {
    const found = validate(step, draft);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    /*
     * `customCategory` is sent only with 'other'. Sending it alongside a real
     * category would let the two disagree on the profile, and whichever a
     * screen happened to read would look like a bug.
     */
    const payload = {
      ...draft,
      customCategory:
        draft.categoryId === OTHER_CATEGORY_ID ? draft.customCategory.trim() : '',
    };
    finishOnboarding(payload)
      .unwrap()
      .then((res) => {
        setToken(res.token);
        refreshRolesFromToken();
        navigate('/subvendor/home');
      })
      .catch(() => {
        /* finishState.error drives the UI — now actually rendered */
      });
  };

  return {
    step,
    stepIndex,
    draft,
    unit,
    errors,
    setField,
    next,
    back,
    finish,
    isFinishing: finishState.isLoading,
    finishError: (finishState.error as NormalizedApiError | undefined) ?? null,
  };
}
