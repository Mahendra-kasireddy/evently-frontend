import {
  useGetQuotationQuery,
  useAcceptQuotationMutation,
  useRejectQuotationMutation,
} from '../service';
import { quotationToDetail } from '../transform';

export function useQuoteDetail(id: string) {
  const { data, isLoading, isError, refetch } = useGetQuotationQuery(id, { skip: !id });
  const [accept, acceptState] = useAcceptQuotationMutation();
  const [reject, rejectState] = useRejectQuotationMutation();

  return {
    data: data ? quotationToDetail(data) : undefined,
    rawStatus: data?.status,
    isLoading,
    isError,
    refetch,
    accept: () => accept(id),
    reject: () => reject(id),
    isActing: acceptState.isLoading || rejectState.isLoading,
  };
}
