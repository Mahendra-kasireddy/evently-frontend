import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { HeroDraft } from './types';

/**
 * Client-only state for the home feature.
 *
 * All server data comes from the backend `home` screen-module in one call
 * (home.service → GET /home/getHomeFeed) — no hard-coded home payload here.
 *
 * This slice owns just the user's in-flight hero-dropdown selections. The
 * initial values are seeded from the backend content (hero.defaultDraft) by
 * the home container once content loads.
 */
const draftInitialState: HeroDraft = { occasion: '', when: '', where: '', guests: '' };

export const heroDraftSlice = createSlice({
  name: 'heroDraft',
  initialState: draftInitialState,
  reducers: {
    setDraft: (_state, action: PayloadAction<HeroDraft>) => action.payload,
    setDraftField: (state, action: PayloadAction<{ field: keyof HeroDraft; value: string }>) => {
      state[action.payload.field] = action.payload.value;
    },
  },
});

export const { setDraft, setDraftField } = heroDraftSlice.actions;
export const selectHeroDraft = (state: { heroDraft: HeroDraft }) => state.heroDraft;
