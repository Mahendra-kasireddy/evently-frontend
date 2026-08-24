import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useGetQuoteRequestsQuery,
  useGetQuoteRequestQuery,
  useAcceptQuotationMutation,
  useRejectQuotationMutation,
  useCancelQuoteRequestMutation,
} from '../service';
import { REQUEST_PARAM } from '../constants';
import type { ApiQuoteRequestSummary } from '../types';

/**
 * The request to land on when the URL doesn't name one: whichever was quoted
 * most recently, so a quote that just arrived is what the customer sees. With
 * no quotes anywhere, the newest request (the list is newest-first).
 */
function defaultRequest(requests: ApiQuoteRequestSummary[]): ApiQuoteRequestSummary | undefined {
  const quoted = requests.filter((r) => (r.quotationCount ?? 0) > 0);
  if (quoted.length === 0) return requests[0];
  return [...quoted].sort((a, b) => {
    const at = a.lastQuotedAt ? Date.parse(a.lastQuotedAt) : 0;
    const bt = b.lastQuotedAt ? Date.parse(b.lastQuotedAt) : 0;
    return bt - at;
  })[0];
}

/**
 * Loads the customer's quote requests and the one currently being viewed.
 *
 * `fixedId` is the My Events path parameter (`/workspace/:requestId`). When it is
 * given, that request is the one shown — the customer picked the event on the hub,
 * so the screen must not second-guess them, and an id that does not exist is
 * reported as not-found rather than silently swapped for another event. Without
 * it the hook falls back to the legacy `?request=` pin and then to a heuristic,
 * which is what the bare /quotes route relied on.
 *
 * Both queries revalidate on mount and on window focus: a quotation sent from
 * the organizer's browser cannot invalidate this browser's cache, so returning
 * to the screen or to the tab is what has to fetch it.
 */
export function useQuotes(fixedId?: string) {
  const [params, setParams] = useSearchParams();
  const requestsQ = useGetQuoteRequestsQuery(undefined, { refetchOnMountOrArgChange: true });
  const requests = useMemo(() => requestsQ.data ?? [], [requestsQ.data]);

  const pinned = fixedId ?? params.get(REQUEST_PARAM);
  const active = useMemo(
    () => (fixedId ? requests.find((r) => r.id === fixedId) : undefined)
      ?? (fixedId ? undefined : requests.find((r) => r.id === pinned) ?? defaultRequest(requests)),
    [requests, pinned, fixedId],
  );
  const activeId = active?.id;
  /** A path-addressed request that this customer does not have. */
  const notFound = !!fixedId && requests.length > 0 && !active;

  const detailQ = useGetQuoteRequestQuery(activeId ?? '', {
    skip: !activeId,
    refetchOnMountOrArgChange: true,
  });

  const selectRequest = useCallback(
    (id: string) => {
      const next = new URLSearchParams(params);
      next.set(REQUEST_PARAM, id);
      setParams(next);
    },
    [params, setParams],
  );

  const [accept, acceptState] = useAcceptQuotationMutation();
  const [reject, rejectState] = useRejectQuotationMutation();
  const [cancel, cancelState] = useCancelQuoteRequestMutation();

  return {
    requests,
    active,
    activeId,
    notFound,
    selectRequest,
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
