import { useGetBookingQuery } from '../service';
export function useBooking() {
  const { data, isLoading } = useGetBookingQuery();
  return { data, isLoading };
}
