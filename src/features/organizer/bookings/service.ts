import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { BookingStatus } from '@features/customer/booking/types';
import type {
  ApiBooking,
  BadgeStatus,
  CreateTaskArgs,
  OrganizerCalendar,
  OrganizerDashboard,
  OrganizerEarnings,
  TaskProofFile,
  UpdateTaskArgs,
} from './types';

/** Uploads a single file to the reusable /upload endpoint, returns its metadata. */
async function uploadFile(file: File, purpose: string): Promise<TaskProofFile> {
  const form = new FormData();
  form.append('file', file);
  form.append('purpose', purpose);
  const config = { headers: { 'Content-Type': undefined } } as unknown as AxiosRequestConfig;
  const { data } = await apiClient.post<TaskProofFile>('/upload', form, config);
  return data;
}

/**
 * Organizer's booking data layer — dashboard stats, the event-execution
 * board, and the calendar. All 100% MongoDB-backed via the booking module's
 * organizer-facing routes. No mock data.
 */
export const organizerBookingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrganizerDashboard: build.query<OrganizerDashboard, void>({
      queryFn: () =>
        toQueryResult(
          async () =>
            (await apiClient.get<OrganizerDashboard>('/booking/organizer/dashboard')).data,
        ),
      providesTags: ['OrganizerBookings', 'OrganizerQuotes'],
    }),
    getOrganizerBookings: build.query<ApiBooking[], void>({
      queryFn: () =>
        toQueryResult(async () => (await apiClient.get<ApiBooking[]>('/booking/organizer/mine')).data),
      providesTags: ['OrganizerBookings'],
    }),
    getOrganizerBooking: build.query<ApiBooking, string>({
      queryFn: (id) =>
        toQueryResult(async () => (await apiClient.get<ApiBooking>(`/booking/${id}`)).data),
      providesTags: ['OrganizerBookings'],
    }),
    getOrganizerCalendar: build.query<OrganizerCalendar, void>({
      queryFn: () =>
        toQueryResult(
          async () => (await apiClient.get<OrganizerCalendar>('/booking/organizer/calendar')).data,
        ),
      providesTags: ['OrganizerBookings'],
    }),
    setDateBlocked: build.mutation<string[], { date: string; blocked: boolean }>({
      queryFn: (body) =>
        toQueryResult(
          async () => (await apiClient.post<string[]>('/booking/organizer/blocked-dates', body)).data,
        ),
      invalidatesTags: ['OrganizerBookings'],
    }),
    updateOrganizerBookingStatus: build.mutation<
      ApiBooking,
      { id: string; status: BookingStatus; note?: string }
    >({
      queryFn: ({ id, status, note }) =>
        toQueryResult(
          async () =>
            (await apiClient.patch<ApiBooking>(`/booking/${id}/status`, { status, note })).data,
        ),
      invalidatesTags: ['OrganizerBookings'],
    }),
    addBookingTask: build.mutation<ApiBooking, CreateTaskArgs>({
      queryFn: ({ bookingId, ...body }) =>
        toQueryResult(
          async () => (await apiClient.post<ApiBooking>(`/booking/${bookingId}/tasks`, body)).data,
        ),
      invalidatesTags: ['OrganizerBookings'],
    }),
    updateBookingTask: build.mutation<ApiBooking, UpdateTaskArgs>({
      queryFn: ({ bookingId, taskId, ...body }) =>
        toQueryResult(
          async () =>
            (await apiClient.patch<ApiBooking>(`/booking/${bookingId}/tasks/${taskId}`, body)).data,
        ),
      invalidatesTags: ['OrganizerBookings'],
    }),
    removeBookingTask: build.mutation<ApiBooking, { bookingId: string; taskId: string }>({
      queryFn: ({ bookingId, taskId }) =>
        toQueryResult(
          async () =>
            (await apiClient.delete<ApiBooking>(`/booking/${bookingId}/tasks/${taskId}`)).data,
        ),
      invalidatesTags: ['OrganizerBookings'],
    }),
    uploadTaskProof: build.mutation<TaskProofFile, { file: File }>({
      queryFn: ({ file }) => toQueryResult(() => uploadFile(file, 'taskProof')),
    }),
    getOrganizerEarnings: build.query<OrganizerEarnings, void>({
      queryFn: () =>
        toQueryResult(
          async () => (await apiClient.get<OrganizerEarnings>('/booking/organizer/earnings')).data,
        ),
      providesTags: ['OrganizerBookings'],
    }),
    getOrganizerBadges: build.query<BadgeStatus, void>({
      queryFn: () =>
        toQueryResult(async () => (await apiClient.get<BadgeStatus>('/booking/organizer/badges')).data),
      providesTags: ['OrganizerBookings'],
    }),
  }),
});

export const {
  useGetOrganizerDashboardQuery,
  useGetOrganizerBookingsQuery,
  useGetOrganizerBookingQuery,
  useGetOrganizerCalendarQuery,
  useSetDateBlockedMutation,
  useUpdateOrganizerBookingStatusMutation,
  useAddBookingTaskMutation,
  useUpdateBookingTaskMutation,
  useRemoveBookingTaskMutation,
  useUploadTaskProofMutation,
  useGetOrganizerEarningsQuery,
  useGetOrganizerBadgesQuery,
} = organizerBookingsApi;
