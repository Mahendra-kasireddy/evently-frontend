import {
  useGetQuoteRequestsQuery,
  useGetQuoteRequestQuery,
  useAcceptQuotationMutation,
  useRejectQuotationMutation,
  useCancelQuoteRequestMutation,
} from '../service';

/**
 * Loads the customer's quote requests, resolves the most relevant one (the
 * first with quotations, else the newest), and exposes accept/reject/cancel.
 */
export function useQuotes() {
  const requestsQ = useGetQuoteRequestsQuery();
  const requests = requestsQ.data ?? [];

  const active =
    requests.find((r) => r.status === 'quoted' || r.status === 'accepted') ?? requests[0];
  const activeId = active?.id;

  const detailQ = useGetQuoteRequestQuery(activeId ?? '', { skip: !activeId });

  const [accept, acceptState] = useAcceptQuotationMutation();
  const [reject, rejectState] = useRejectQuotationMutation();
  const [cancel, cancelState] = useCancelQuoteRequestMutation();

  return {
    requests,
    detail: detailQ.data,
    isLoading: requestsQ.isLoading || (!!activeId && detailQ.isLoading && !detailQ.data),
    isError: requestsQ.isError || detailQ.isError,
    refetch: () => {
      void requestsQ.refetch();
      if (activeId) void detailQ.refetch();
    },
    accept,
    reject,
    cancel,
    isActing: acceptState.isLoading || rejectState.isLoading || cancelState.isLoading,
  };
}
