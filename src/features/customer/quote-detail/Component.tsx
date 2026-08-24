import { QuoteDetailHero, ItemizedBreakdown, PaymentSummary } from './sections';
import type { QuoteDetail } from './types';
import type { QuotationStatus } from '@features/customer/quotes/types';
import styles from './styles.module.css';

export interface QuoteDetailComponentProps {
  q: QuoteDetail;
  rawStatus?: QuotationStatus | undefined;
  isActing: boolean;
  onAccept: () => { unwrap: () => Promise<unknown> };
  onReject: () => { unwrap: () => Promise<unknown> };
  /**
   * Up one level, back to the event. Omitted when the page has a breadcrumb trail
   * of its own, so the customer sees one back control rather than two.
   */
  onBack?: (() => void) | undefined;
  backLabel?: string | undefined;
  /** Accepted: on to checkout for this quotation. */
  onAccepted: () => void;
  /** Declined: back to the event, where the response now reads "Declined". */
  onRejected: () => void;
}

/**
 * One organizer's response in full — itemised breakdown and payment summary.
 *
 * Route-agnostic: accept and decline outcomes and the back destination all arrive
 * as callbacks, so the same component serves the My Events response page
 * (`/workspace/:requestId/:quotationId`) and stays inside that section.
 */
export function Component({
  q,
  rawStatus,
  isActing,
  onAccept,
  onReject,
  onBack,
  backLabel,
  onAccepted,
  onRejected,
}: QuoteDetailComponentProps) {
  const decided = rawStatus === 'accepted' || rawStatus === 'rejected' || rawStatus === 'withdrawn';

  const handleAccept = async () => {
    try {
      await onAccept().unwrap();
      onAccepted();
    } catch {
      /* mutation error surfaces via state */
    }
  };
  const handleReject = async () => {
    try {
      await onReject().unwrap();
      onRejected();
    } catch {
      /* mutation error surfaces via state */
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <QuoteDetailHero q={q} onBack={onBack} backLabel={backLabel} />
        <div className={styles.grid}>
          <ItemizedBreakdown items={q.items} />
          <PaymentSummary
            q={q}
            onAccept={handleAccept}
            onReject={handleReject}
            isActing={isActing}
            decided={decided}
          />
        </div>
      </div>
    </main>
  );
}
