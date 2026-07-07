import { useAppDispatch, useAppSelector } from '@app/hooks';
import { useGetPlanDataQuery, selectPlanDraft, setOccasion, setPlanField, setStep, toggleCategory } from '../service';
import type { PlanDraft } from '../types';

export function usePlan() {
  const { data, isLoading } = useGetPlanDataQuery();
  const draft = useAppSelector(selectPlanDraft);
  const dispatch = useAppDispatch();
  return {
    data, isLoading, draft,
    setOccasion: (id: string) => dispatch(setOccasion(id)),
    setField: (field: keyof PlanDraft, value: string) => dispatch(setPlanField({ field, value })),
    setStep: (n: number) => dispatch(setStep(n)),
    toggleCategory: (id: string) => dispatch(toggleCategory(id)),
  };
}
