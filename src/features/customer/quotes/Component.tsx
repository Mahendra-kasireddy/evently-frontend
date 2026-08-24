import { useState } from 'react';
import { MessageSquareQuote, XCircle } from 'lucide-react';
import { EmptyState } from '@shared/components';
import { QuotesHero, QuotesList, ComparisonTable, QuoteTimeline, RequestSwitcher } from './sections';
import type { ApiQuoteRequestDetail, ApiQuoteRequestSummary } from './types';
import { buildQuotesData } from './transform';
import styles from './styles.module.css';

export interface QuotesComponentProps {
  detail: ApiQuoteRequestDetail;
  /**
   * Other requests this customer has raised — drives the switcher tabs. Pass an
   * empty array on the My Events event page: the hub is the event picker there,
   * and a second picker inside a page titled with one event is what made the
   * screen ambiguous in the first place.
   */
  requests: ApiQuoteRequestSummary[];
  onSelectRequest: (requestId: string) => void;
  isActing: boolean;
  onCancel: (requestId: string) => void;
  /** Opens one organizer's response in full — the "review" step. */
  onOpenResponse: (quotationId: string) => void;
  /**
   * Leaves this event. Omitted when the page has a breadcrumb trail of its own —
   * the trail's back control is then the single, unambiguous way out.
   */
  onBack?: (() => void) | undefined;
  backLabel?: string | undefined;
  /** Where the "waiting on quotes" empty state sends the customer. */
  onLeave: () => void;
}

/**
 * The comparison view for a single event's organizer responses.
 *
 * Presentational and route-agnostic: every destination arrives as a callback, so
 * the same component serves the My Events event page (`/workspace/:requestId`)
 * without knowing anything about the surrounding URL shape.
 */
export function Component({
  detail,
  requests,
  onSelectRequest,
  isActing,
  onCancel,
  onOpenResponse,
  onBack,
  backLabel,
  onLeave,
}: QuotesComponentProps) {
  const data = buildQuotesData(detail);

  const comparableIds = detail.quotations.filter((q) => q.status !== 'withdrawn').map((q) => q.id);
  const [selected, setSelected] = useState<string[]>(comparableIds.slice(0, 2));
  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s));

  const isCancelled = detail.status === 'cancelled';
  const canCancel = detail.status !== 'accepted' && !isCancelled;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <QuotesHero
          eyebrow={data.eyebrow}
          heading={data.heading}
          subtitle={data.subtitle}
          onBack={onBack}
          backLabel={backLabel}
        />

        <RequestSwitcher requests={requests} activeId={detail.id} onSelect={onSelectRequest} />

        <QuoteTimeline events={detail.timeline} />

        {data.quotes.length === 0 ? (
          <EmptyState
            icon={MessageSquareQuote}
            title="Waiting on quotes"
            message="Your request is with the organizers. As soon as they respond, their quotes will appear here to compare."
            actionLabel="Back to My Events"
            onAction={onLeave}
          />
        ) : (
          <>
            {canCancel && (
              <div className={styles.actionRow}>
                <button
                  type="button"
                  className={styles.cancelReq}
                  onClick={() => onCancel(detail.id)}
                  disabled={isActing}
                >
                  <XCircle size={15} /> Cancel this request
                </button>
              </div>
            )}
            <div className={styles.grid}>
              <QuotesList
                quotes={data.quotes}
                selected={selected}
                onToggle={toggle}
                onOpen={onOpenResponse}
              />
              <ComparisonTable
                data={data}
                selected={selected}
                onAcceptBest={(quotationId) => quotationId && onOpenResponse(quotationId)}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
