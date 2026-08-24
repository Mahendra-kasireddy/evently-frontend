import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { AcademyStatus } from './types';

/** Organizer's Evently Academy progress — 100% MongoDB-backed. No mock data. */
export const academyApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAcademy: build.query<AcademyStatus, void>({
      queryFn: () => toQueryResult(async () => (await apiClient.get<AcademyStatus>('/organizer/academy')).data),
      providesTags: ['Academy'],
    }),
    completeLesson: build.mutation<AcademyStatus, string>({
      queryFn: (key) =>
        toQueryResult(
          async () => (await apiClient.post<AcademyStatus>('/organizer/academy/complete-lesson', { key })).data,
        ),
      invalidatesTags: ['Academy'],
    }),
    registerWorkshop: build.mutation<AcademyStatus, string>({
      queryFn: (key) =>
        toQueryResult(
          async () =>
            (await apiClient.post<AcademyStatus>('/organizer/academy/register-workshop', { key })).data,
        ),
      invalidatesTags: ['Academy'],
    }),
    completeStage3: build.mutation<AcademyStatus, string>({
      queryFn: (key) =>
        toQueryResult(
          async () => (await apiClient.post<AcademyStatus>('/organizer/academy/complete-stage3', { key })).data,
        ),
      invalidatesTags: ['Academy'],
    }),
  }),
});

export const {
  useGetAcademyQuery,
  useCompleteLessonMutation,
  useRegisterWorkshopMutation,
  useCompleteStage3Mutation,
} = academyApi;
