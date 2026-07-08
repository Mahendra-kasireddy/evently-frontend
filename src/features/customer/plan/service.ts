import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type {
  PlanData,
  PlanDraft,
  PlanOrganizer,
  PlanQuoteRequest,
  PlanSubmission,
  PlanUpsert,
  RecommendationArgs,
} from './types';

/** Plan Event wizard config, assembled by the backend `plan` screen-module. */
async function fetchPlanData(): Promise<PlanData> {
  const { data } = await apiClient.get<PlanData>('/plan/getPlanScreen');
  return data;
}

/** Real organizers scored by the backend recommendation engine against the plan context. */
async function fetchPlanOrganizers(args: RecommendationArgs): Promise<PlanOrganizer[]> {
  const { data } = await apiClient.get<PlanOrganizer[]>('/plan/getOrganizers', {
    params: {
      categories: args.categories.join(','),
      occasion: args.occasion || undefined,
      guests: args.guests || undefined,
      city: args.city || undefined,
      budget: args.budget || undefined,
    },
  });
  return data;
}

export interface PlanQuoteArgs {
  organizerId: string;
  occasion: string;
  when?: string;
  where?: string;
  guests?: string;
}

export const planApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPlanData: build.query<PlanData, void>({
      queryFn: () => toQueryResult(() => fetchPlanData()),
    }),
    getPlanOrganizers: build.query<PlanOrganizer[], RecommendationArgs>({
      queryFn: (args) => toQueryResult(() => fetchPlanOrganizers(args)),
    }),
    planRequestQuote: build.mutation<{ id: string }, PlanQuoteArgs>({
      queryFn: (args) =>
        toQueryResult(
          async () =>
            (await apiClient.post<{ id: string }>('/quote/requestQuoteFromOrganizer', args)).data,
        ),
      invalidatesTags: ['Quotes'],
    }),

    // ----- Persistence (authenticated customer) -----

    /** Resume the customer's live draft (null if none). */
    getMyDraft: build.query<PlanSubmission | null, void>({
      queryFn: () =>
        toQueryResult(async () => (await apiClient.get<PlanSubmission | null>('/plan/getMyDraft')).data),
      providesTags: ['Plans'],
    }),
    /** All plans owned by the customer. */
    getMyPlans: build.query<PlanSubmission[], void>({
      queryFn: () =>
        toQueryResult(async () => (await apiClient.get<PlanSubmission[]>('/plan/getMyPlans')).data),
      providesTags: ['Plans'],
    }),
    /** All quote requests the customer has raised (workspace quote status). */
    getMyQuotes: build.query<PlanQuoteRequest[], void>({
      queryFn: () =>
        toQueryResult(
          async () => (await apiClient.get<PlanQuoteRequest[]>('/quote/getMyQuotes')).data,
        ),
      providesTags: ['Quotes'],
    }),
    /** Silent autosave of the wizard draft. */
    savePlanDraft: build.mutation<PlanSubmission, PlanUpsert>({
      queryFn: (body) =>
        toQueryResult(async () => (await apiClient.put<PlanSubmission>('/plan/saveDraft', body)).data),
      invalidatesTags: ['Plans'],
    }),
    /** Submit (persist) the plan — returns the created record + plan code. */
    createPlan: build.mutation<PlanSubmission, PlanUpsert>({
      queryFn: (body) =>
        toQueryResult(async () => (await apiClient.post<PlanSubmission>('/plan/createPlan', body)).data),
      invalidatesTags: ['Plans'],
    }),
  }),
});
export const {
  useGetPlanDataQuery,
  useGetPlanOrganizersQuery,
  usePlanRequestQuoteMutation,
  useGetMyDraftQuery,
  useGetMyPlansQuery,
  useGetMyQuotesQuery,
  useSavePlanDraftMutation,
  useCreatePlanMutation,
} = planApi;

/** Editable event draft (client state) for the plan wizard. Date defaults to today. */
const draftInitial: PlanDraft = {
  occasionId: 'wedding', eventDate: new Date().toISOString().slice(0, 10), city: '', area: '', guests: '', budget: '', ideas: '', categories: [], selectedOrganizerId: '', step: 0,
};

export const planSlice = createSlice({
  name: 'planDraft',
  initialState: draftInitial,
  reducers: {
    setOccasion: (s, a: PayloadAction<string>) => { s.occasionId = a.payload; },
    setPlanField: (s, a: PayloadAction<{ field: keyof PlanDraft; value: string }>) => {
      if (a.payload.field !== 'step') (s[a.payload.field] as string) = a.payload.value;
    },
    setStep: (s, a: PayloadAction<number>) => { s.step = a.payload; },
    setSelectedOrganizer: (s, a: PayloadAction<string>) => { s.selectedOrganizerId = a.payload; },
    toggleCategory: (s, a: PayloadAction<string>) => {
      s.categories = s.categories.includes(a.payload) ? s.categories.filter((c) => c !== a.payload) : [...s.categories, a.payload];
    },
    hydrateDraft: (s, a: PayloadAction<Partial<PlanDraft>>) => ({ ...s, ...a.payload }),
  },
});
export const { setOccasion, setPlanField, setStep, setSelectedOrganizer, toggleCategory, hydrateDraft } = planSlice.actions;
export const selectPlanDraft = (state: { planDraft: PlanDraft }) => state.planDraft;
