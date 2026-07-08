import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { ApiBooking, BookingStatus } from './types';

/**
 * Booking data layer — 100% MongoDB-backed. Create a booking from an accepted
 * quotation, read details/history, and drive status transitions. No mock JSON.
 */
export const bookingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createBooking: build.mutation<ApiBooking, { quotationId: string }>({
      queryFn: (body) =>
        toQueryResult(async () => (await apiClient.post<ApiBooking>('/booking', body)).data),
      invalidatesTags: ['Bookings', 'CustomerHome', 'Notifications'],
    }),
    getBooking: build.query<ApiBooking, string>({
      queryFn: (id) =>
        toQueryResult(async () => (await apiClient.get<ApiBooking>(`/booking/${id}`)).data),
      providesTags: ['Bookings'],
    }),
    getMyBookings: build.query<ApiBooking[], void>({
      queryFn: () =>
        toQueryResult(async () => (await apiClient.get<ApiBooking[]>('/booking/my-bookings')).data),
      providesTags: ['Bookings'],
    }),
    updateBookingStatus: build.mutation<
      ApiBooking,
      { id: string; status: BookingStatus; note?: string }
    >({
      queryFn: ({ id, status, note }) =>
        toQueryResult(
          async () =>
            (await apiClient.patch<ApiBooking>(`/booking/${id}/status`, { status, note })).data,
        ),
      invalidatesTags: ['Bookings', 'CustomerHome', 'Notifications'],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetBookingQuery,
  useGetMyBookingsQuery,
  useUpdateBookingStatusMutation,
} = bookingApi;
