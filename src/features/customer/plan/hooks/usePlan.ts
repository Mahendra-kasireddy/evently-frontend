import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { selectAuth } from '@app/auth/authSlice';
import {
  useGetPlanDataQuery,
  useGetMyDraftQuery,
  useSavePlanDraftMutation,
  selectPlanDraft,
  setOccasion,
  setPlanField,
  setStep,
  setSelectedOrganizer,
  toggleCategory,
  hydrateDraft,
} from '../service';
import type { PlanDraft, PlanUpsert } from '../types';

/** Maps the client draft to the persistence payload. */
export function draftToUpsert(draft: PlanDraft): PlanUpsert {
  return {
    occasion: draft.occasionId,
    eventDate: draft.eventDate || undefined,
    city: draft.city,
    area: draft.area,
    guests: draft.guests,
    budget: draft.budget,
    ideas: draft.ideas,
    categories: draft.categories,
  };
}

/** True once the user has entered anything worth persisting. */
function isMeaningful(draft: PlanDraft): boolean {
  return Boolean(
    draft.city || draft.area || draft.guests || draft.budget || draft.ideas || draft.categories.length,
  );
}

export function usePlan() {
  const { data, isLoading, isError, refetch } = useGetPlanDataQuery();
  const draft = useAppSelector(selectPlanDraft);
  const dispatch = useAppDispatch();

  const { status } = useAppSelector(selectAuth);
  const isAuthed = status === 'authenticated';

  // Resume a saved draft once, for signed-in customers.
  const { data: savedDraft } = useGetMyDraftQuery(undefined, { skip: !isAuthed });
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current || !savedDraft) return;
    hydratedRef.current = true;
    const patch: Partial<PlanDraft> = {};
    if (savedDraft.occasion) patch.occasionId = savedDraft.occasion;
    if (savedDraft.eventDate) patch.eventDate = savedDraft.eventDate.slice(0, 10);
    if (savedDraft.city) patch.city = savedDraft.city;
    if (savedDraft.area) patch.area = savedDraft.area;
    if (savedDraft.guests) patch.guests = savedDraft.guests;
    if (savedDraft.budget) patch.budget = savedDraft.budget;
    if (savedDraft.ideas) patch.ideas = savedDraft.ideas;
    if (savedDraft.categories?.length) patch.categories = savedDraft.categories;
    if (Object.keys(patch).length) dispatch(hydrateDraft(patch));
  }, [savedDraft, dispatch]);

  // Silent, debounced autosave for signed-in customers.
  const [saveDraft] = useSavePlanDraftMutation();
  useEffect(() => {
    if (!isAuthed || !isMeaningful(draft)) return;
    const id = window.setTimeout(() => {
      void saveDraft(draftToUpsert(draft));
    }, 800);
    return () => window.clearTimeout(id);
  }, [isAuthed, draft, saveDraft]);

  return {
    data, isLoading, isError, refetch, draft,
    setOccasion: (id: string) => dispatch(setOccasion(id)),
    setField: (field: keyof PlanDraft, value: string) => dispatch(setPlanField({ field, value })),
    setStep: (n: number) => dispatch(setStep(n)),
    setSelectedOrganizer: (id: string) => dispatch(setSelectedOrganizer(id)),
    toggleCategory: (id: string) => dispatch(toggleCategory(id)),
  };
}
