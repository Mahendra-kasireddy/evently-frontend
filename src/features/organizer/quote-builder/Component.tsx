import { FileText, IndianRupee, Info, MessageSquare, PenLine } from 'lucide-react';
import { EmptyBox, Notice, PageStack, Pills, Stat, StatRow, formatInr } from '@shared/partner';
import { JobCard } from './sections';
import { QUOTE_BUILDER_COPY as COPY, QUOTE_FILTERS } from './constants';
import type { StagedRequest } from './hooks';
import type { QuoteFilter } from './types';
import styles from './styles.module.css';

export interface QuoteBuilderComponentProps {
  filter: QuoteFilter;
  onFilterChange: (next: QuoteFilter) => void;
  counts: Record<QuoteFilter, number>;
  visible: StagedRequest[];
  sentValue: number;
  hasAny: boolean;
}

const EMPTY_FOR_FILTER: Record<QuoteFilter, { title: string; body: string }> = {
  All: { title: COPY.emptyAllTitle, body: COPY.emptyAllBody },
  Awaiting: { title: COPY.emptyAwaitingTitle, body: COPY.emptyAwaitingBody },
  Drafts: { title: COPY.emptyDraftsTitle, body: COPY.emptyDraftsBody },
  Sent: { title: COPY.emptySentTitle, body: COPY.emptySentBody },
};

export function Component({
  filter,
  onFilterChange,
  counts,
  visible,
  sentValue,
  hasAny,
}: QuoteBuilderComponentProps) {
  const empty = EMPTY_FOR_FILTER[filter];

  return (
    <PageStack>
      <p className={styles.subtitle}>{COPY.subtitle}</p>

      <StatRow>
        <Stat
          label={COPY.awaitingTitle}
          value={counts.Awaiting}
          icon={<MessageSquare size={16} />}
          tone="amber"
        />
        <Stat label={COPY.draftTitle} value={counts.Drafts} icon={<PenLine size={16} />} tone="navy" />
        <Stat label={COPY.sentTitle} value={counts.Sent} icon={<FileText size={16} />} tone="teal" />
        <Stat
          label="Value on the table"
          value={formatInr(sentValue)}
          icon={<IndianRupee size={16} />}
          tone="coral"
        />
      </StatRow>

      <Pills options={QUOTE_FILTERS} value={filter} onChange={onFilterChange} counts={counts} />

      {counts.Drafts > 0 && (
        <Notice tone="navy" icon={<Info size={15} />}>
          {COPY.notice}
        </Notice>
      )}

      {visible.length === 0 ? (
        <EmptyBox
          icon={<FileText size={34} className={styles.emptyIcon} />}
          title={hasAny ? empty.title : COPY.emptyAllTitle}
          body={hasAny ? empty.body : COPY.emptyAllBody}
        />
      ) : (
        <div className={styles.list}>
          {visible.map(({ request, stage }) => (
            <JobCard key={request.id} request={request} stage={stage} />
          ))}
        </div>
      )}
    </PageStack>
  );
}

export default Component;
