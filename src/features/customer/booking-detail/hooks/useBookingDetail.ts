import {
  useGetBookingQuery,
  useUpdateBookingStatusMutation,
} from '@features/customer/booking/service';

export function useBookingDetail(id: string) {
  const { data, isLoading, isError, refetch } = useGetBookingQuery(id, { skip: !id });
  const [update, { isLoading: isCancelling }] = useUpdateBookingStatusMutation();

  return {
    booking: data,
    isLoading,
    isError,
    refetch,
    isCancelling,
    cancel: () => update({ id, status: 'cancelled' }),
  };
}
