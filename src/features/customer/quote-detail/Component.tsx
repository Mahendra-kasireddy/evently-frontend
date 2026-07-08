import { useNavigate } from 'react-router-dom';
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
}

export function Component({ q, rawStatus, isActing, onAccept, onReject }: QuoteDetailComponentProps) {
  const navigate = useNavigate();
  const decided = rawStatus === 'accepted' || rawStatus === 'rejected' || rawStatus === 'withdrawn';

  const handleAccept = async () => {
    try {
      await onAccept().unwrap();
      navigate(`/booking/${q.id}`);
    } catch {
      /* mutation error surfaces via state */
    }
  };
  const handleReject = async () => {
    try {
      await onReject().unwrap();
      navigate('/quotes');
    } catch {
      /* mutation error surfaces via state */
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <QuoteDetailHero q={q} onBack={() => navigate(-1)} />
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
