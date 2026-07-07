import { useNavigate } from 'react-router-dom';
import { QuoteDetailHero, ItemizedBreakdown, PaymentSummary } from './sections';
import type { QuoteDetail } from './types';
import styles from './styles.module.css';

export function Component({ q }: { q: QuoteDetail }) {
  const navigate = useNavigate();
  return (
    <>
      <main className={styles.page}>
        <div className={styles.container}>
          <QuoteDetailHero q={q} onBack={() => navigate(-1)} />
          <div className={styles.grid}>
            <ItemizedBreakdown items={q.items} />
            <PaymentSummary q={q} onAccept={() => navigate('/booking')} />
          </div>
        </div>
      </main>
    </>
  );
}
