import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquareQuote, XCircle } from 'lucide-react';
import { EmptyState } from '@shared/components';
import { QuotesHero, QuotesList, ComparisonTable, QuoteTimeline } from './sections';
import type { ApiQuoteRequestDetail } from './types';
import { buildQuotesData } from './transform';
import styles from './styles.module.css';

export interface QuotesComponentProps {
  detail: ApiQuoteRequestDetail;
  isActing: boolean;
  onCancel: (requestId: string) => void;
}

export function Component({ detail, isActing, onCancel }: QuotesComponentProps) {
  const navigate = useNavigate();
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
          onBack={() => navigate(-1)}
        />

        <QuoteTimeline events={detail.timeline} />

        {data.quotes.length === 0 ? (
          <EmptyState
            icon={MessageSquareQuote}
            title="Waiting on quotes"
            message="Your request is with the organizers. As soon as they respond, their quotes will appear here to compare."
            actionLabel="Back to workspace"
            onAction={() => navigate('/workspace')}
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
              <QuotesList quotes={data.quotes} selected={selected} onToggle={toggle} />
              <ComparisonTable
                data={data}
                selected={selected}
                onAcceptBest={() => data.bestId && navigate(`/quote/${data.bestId}`)}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
