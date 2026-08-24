import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { ApiSubVendorTask, BookingTaskStatus, TaskProofFile } from './types';

async function uploadFile(file: File, purpose: string): Promise<TaskProofFile> {
  const form = new FormData();
  form.append('file', file);
  form.append('purpose', purpose);
  const config = { headers: { 'Content-Type': undefined } } as unknown as AxiosRequestConfig;
  const { data } = await apiClient.post<TaskProofFile>('/upload', form, config);
  return data;
}

/**
 * Sub-vendor's own task data layer — 100% MongoDB-backed via the booking
 * module's sub-vendor-facing routes. No mock data.
 */
export const subVendorTasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyTasks: build.query<ApiSubVendorTask[], void>({
      queryFn: () =>
        toQueryResult(async () => (await apiClient.get<ApiSubVendorTask[]>('/booking/subvendor/mine')).data),
      providesTags: ['SubVendorTasks'],
    }),
    respondToTask: build.mutation<void, { bookingId: string; taskId: string; accept: boolean }>({
      queryFn: ({ bookingId, taskId, accept }) =>
        toQueryResult(async () => {
          await apiClient.patch(`/booking/subvendor/${bookingId}/tasks/${taskId}/respond`, { accept });
        }),
      invalidatesTags: ['SubVendorTasks'],
    }),
    updateOwnTask: build.mutation<
      void,
      { bookingId: string; taskId: string; status?: BookingTaskStatus; photoProof?: TaskProofFile }
    >({
      queryFn: ({ bookingId, taskId, ...body }) =>
        toQueryResult(async () => {
          await apiClient.patch(`/booking/subvendor/${bookingId}/tasks/${taskId}`, body);
        }),
      invalidatesTags: ['SubVendorTasks'],
    }),
    /*
     * Named distinctly from the organizer's own proof upload.
     *
     * `features/organizer/bookings/service.ts` also defined `uploadTaskProof`
     * on the same `baseApi`. `injectEndpoints` silently discards a repeat
     * registration of a name, and that module is in the eager set (imported by
     * OrganizerLayout), so THIS definition was always the discarded one — the
     * hook below was really running the organizer's. Harmless while the two
     * were identical, but this module declares `originalName` as required while
     * the definition actually serving it has it optional, so the sub-vendor's
     * type was already a lie and any divergence would have broken it silently.
     */
    uploadSubvendorTaskProof: build.mutation<TaskProofFile, { file: File }>({
      queryFn: ({ file }) => toQueryResult(() => uploadFile(file, 'taskProof')),
    }),
  }),
});

export const {
  useGetMyTasksQuery,
  useRespondToTaskMutation,
  useUpdateOwnTaskMutation,
  useUploadSubvendorTaskProofMutation,
} = subVendorTasksApi;
