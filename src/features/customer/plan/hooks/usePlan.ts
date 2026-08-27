import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { selectAuth } from '@app/auth/authSlice';
import {
  useGetPlanDataQuery,
  useGetMyDraftQuery,
  useGetPlanQuery,
  useSavePlanDraftMutation,
  useUpdatePlanMutation,
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

  /*
   * A category tapped on Home arrives as `?occasion=<id>`. Applied once, and
   * validated against the occasions the API actually serves so a hand-edited
   * URL cannot put the planner into a state no step can render.
   *
   * It outranks a resumed draft on purpose: the tap is what the person wants
   * now, and silently reinstating last week's occasion is exactly the bug this
   * fixes.
   */
  const [searchParams] = useSearchParams();
  const requestedOccasion = searchParams.get('occasion') ?? '';
  const urlOccasionRef = useRef('');

  /*
   * `?plan=<id>` — an already-submitted plan reopened from My Events to be
   * corrected and resent. It outranks both the URL occasion and the resumed
   * draft: the customer asked for this specific plan, so nothing else may
   * overwrite it.
   */
  const editingPlanId = (searchParams.get('plan') ?? '').trim();
  const { data: editingPlan } = useGetPlanQuery(editingPlanId, { skip: !editingPlanId });
  const editHydratedRef = useRef('');

  useEffect(() => {
    if (!editingPlan || editHydratedRef.current === editingPlan.id) return;
    editHydratedRef.current = editingPlan.id;
    // Assembled key by key rather than spread: `exactOptionalPropertyTypes`
    // rejects an explicit undefined, and an absent field must leave the draft's
    // own value alone rather than blanking it.
    const patch: Partial<PlanDraft> = {};
    if (editingPlan.occasion) patch.occasionId = editingPlan.occasion;
    if (editingPlan.eventDate) patch.eventDate = editingPlan.eventDate.slice(0, 10);
    if (editingPlan.city) patch.city = editingPlan.city;
    if (editingPlan.area) patch.area = editingPlan.area;
    if (editingPlan.guests) patch.guests = editingPlan.guests;
    if (editingPlan.budget) patch.budget = editingPlan.budget;
    if (editingPlan.ideas) patch.ideas = editingPlan.ideas;
    if (editingPlan.categories?.length) patch.categories = editingPlan.categories;
    if (Object.keys(patch).length) dispatch(hydrateDraft(patch));
  }, [editingPlan, dispatch]);


  useEffect(() => {
    if (!requestedOccasion || !data || editingPlanId) return;
    if (urlOccasionRef.current === requestedOccasion) return;
    if (!data.occasions.some((o) => o.id === requestedOccasion)) return;
    urlOccasionRef.current = requestedOccasion;
    dispatch(setOccasion(requestedOccasion));
  }, [requestedOccasion, data, dispatch, editingPlanId]);

  // Resume a saved draft once, for signed-in customers.
  const { data: savedDraft } = useGetMyDraftQuery(undefined, { skip: !isAuthed });
  const hydratedRef = useRef(false);
  useEffect(() => {
    // An explicitly opened plan wins over whatever draft happens to be live.
    if (hydratedRef.current || !savedDraft || editingPlanId) return;
    hydratedRef.current = true;
    const patch: Partial<PlanDraft> = {};
    // Skipped when Home named one: whichever effect runs second, the tap wins.
    if (savedDraft.occasion && !urlOccasionRef.current) patch.occasionId = savedDraft.occasion;
    if (savedDraft.eventDate) patch.eventDate = savedDraft.eventDate.slice(0, 10);
    if (savedDraft.city) patch.city = savedDraft.city;
    if (savedDraft.area) patch.area = savedDraft.area;
    if (savedDraft.guests) patch.guests = savedDraft.guests;
    if (savedDraft.budget) patch.budget = savedDraft.budget;
    if (savedDraft.ideas) patch.ideas = savedDraft.ideas;
    if (savedDraft.categories?.length) patch.categories = savedDraft.categories;
    if (Object.keys(patch).length) dispatch(hydrateDraft(patch));
  }, [savedDraft, dispatch, editingPlanId]);

  /*
   * Silent, debounced autosave for signed-in customers.
   *
   * When an existing plan is being corrected, this writes back to *that* plan.
   * It used to call `saveDraft` unconditionally, which created a fresh draft
   * beside the plan being edited — so editing a submitted plan left two
   * records, which is the duplicate the customer reported.
   */
  const [saveDraft] = useSavePlanDraftMutation();
  const [updatePlan] = useUpdatePlanMutation();
  useEffect(() => {
    if (!isAuthed || !isMeaningful(draft)) return;
    const id = window.setTimeout(() => {
      if (editingPlanId) {
        void updatePlan({ id: editingPlanId, body: draftToUpsert(draft) });
      } else {
        void saveDraft(draftToUpsert(draft));
      }
    }, 800);
    return () => window.clearTimeout(id);
  }, [isAuthed, draft, saveDraft, updatePlan, editingPlanId]);

  return {
    data, isLoading, isError, refetch, draft,
    /** Set when the wizard is correcting an existing plan rather than starting one. */
    editingPlanId,
    setOccasion: (id: string) => dispatch(setOccasion(id)),
    setField: (field: keyof PlanDraft, value: string) => dispatch(setPlanField({ field, value })),
    setStep: (n: number) => dispatch(setStep(n)),
    setSelectedOrganizer: (id: string) => dispatch(setSelectedOrganizer(id)),
    toggleCategory: (id: string) => dispatch(toggleCategory(id)),
  };
}
