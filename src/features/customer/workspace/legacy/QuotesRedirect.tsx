import { Navigate, useSearchParams } from 'react-router-dom';
import { LoadingScreen } from '@shared/components';
import { useGetQuotationQuery, useGetQuoteRequestsQuery } from '@features/customer/quotes/service';
import { REQUEST_PARAM } from '@features/customer/quotes/constants';
import { MY_EVENTS_ROUTE, eventRoute, responseRoute } from '../routes';

/**
 * `/quotes` and `/quotes?request=<id>` → the My Events equivalents.
 *
 * The comparison lives under My Events now. These redirects exist so links
 * already in the wild — old notifications, a bookmark, a URL someone shared —
 * land in the right place instead of 404ing, without keeping a second route that
 * renders the same screen.
 */
export function QuotesRedirect() {
  const [params] = useSearchParams();
  const requestId = params.get(REQUEST_PARAM);
  return <Navigate to={requestId ? eventRoute(requestId) : MY_EVENTS_ROUTE} replace />;
}

/**
 * `/quote/:id` → `/workspace/<its request>/<id>`.
 *
 * A quotation knows which request it belongs to, but only the API does — so this
 * has to resolve it before it can redirect. Any failure falls back to the hub,
 * which is always a valid place to be.
 */
export function QuoteDetailRedirect({ id }: { id: string }) {
  const { data, isLoading, isError } = useGetQuotationQuery(id, { skip: !id });
  // Warms the cache the destination page needs for its breadcrumb label.
  useGetQuoteRequestsQuery();

  if (!id || isError) return <Navigate to={MY_EVENTS_ROUTE} replace />;
  if (isLoading || !data) return <LoadingScreen message="Opening this response…" />;
  return <Navigate to={responseRoute(data.requestId, id)} replace />;
}
