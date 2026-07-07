import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { PlanData, PlanDraft, PlanOrganizer } from './types';

/** Plan Event wizard data, from the backend `plan` screen-module. */
async function fetchPlanData(): Promise<PlanData> {
  const { data } = await apiClient.get<PlanData>('/plan/getPlanScreen');
  return data;
}

/** Real organizers matched against the user's selected categories. */
async function fetchPlanOrganizers(categories: string[]): Promise<PlanOrganizer[]> {
  const { data } = await apiClient.get<PlanOrganizer[]>('/plan/getOrganizers', {
    params: { categories: categories.join(',') },
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
    getPlanOrganizers: build.query<PlanOrganizer[], string[]>({
      queryFn: (categories) => toQueryResult(() => fetchPlanOrganizers(categories)),
    }),
    planRequestQuote: build.mutation<{ id: string }, PlanQuoteArgs>({
      queryFn: (args) => toQueryResult(async () => (await apiClient.post<{ id: string }>(
            '/quote/requestQuoteFromOrganizer',
            args,
          )).data),
      invalidatesTags: ['Quotes'],
    }),
  }),
});
export const { useGetPlanDataQuery, useGetPlanOrganizersQuery, usePlanRequestQuoteMutation } =
  planApi;

/** Editable event draft (client state) for the plan wizard. Date defaults to today. */
const draftInitial: PlanDraft = {
  occasionId: 'wedding', eventDate: new Date().toISOString().slice(0, 10), city: '', area: '', guests: '', ideas: '', categories: [], step: 0,
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
    toggleCategory: (s, a: PayloadAction<string>) => {
      s.categories = s.categories.includes(a.payload) ? s.categories.filter((c) => c !== a.payload) : [...s.categories, a.payload];
    },
  },
});
export const { setOccasion, setPlanField, setStep, toggleCategory } = planSlice.actions;
export const selectPlanDraft = (state: { planDraft: PlanDraft }) => state.planDraft;
