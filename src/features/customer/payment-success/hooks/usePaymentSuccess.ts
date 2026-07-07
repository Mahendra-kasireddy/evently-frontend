import { useGetPaymentSuccessQuery } from '../service';
export function usePaymentSuccess() {
  const { data, isLoading } = useGetPaymentSuccessQuery();
  return { data, isLoading };
}
