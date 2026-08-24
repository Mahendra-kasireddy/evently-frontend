import { useMemo, useState } from 'react';
import { Inbox, Info } from 'lucide-react';
import { EmptyBox, Pills } from '@shared/partner';
import { RequestCard } from './sections';
import { QUOTES_COPY } from './constants';
import type { ApiIncomingRequest } from './types';
import styles from './styles.module.css';

export interface OrganizerQuotesComponentProps {
  requests: ApiIncomingRequest[];
}

const TABS = ['All', 'New', 'Quoted', 'Confirmed', 'Closed'] as const;
type Tab = (typeof TABS)[number];

const CLOSED_QUOTE_STATUSES = new Set(['rejected', 'withdrawn']);

function tabOf(r: ApiIncomingRequest): Tab {
  if (r.status === 'cancelled' || r.status === 'closed') return 'Closed';
  if (r.myQuotation && CLOSED_QUOTE_STATUSES.has(r.myQuotation.status)) return 'Closed';
  if (r.myQuotation?.status === 'accepted') return 'Confirmed';
  if (r.myQuotation) return 'Quoted';
  return 'New';
}

export function Component({ requests }: OrganizerQuotesComponentProps) {
  // The design opens on New — the enquiries still waiting on a reply. Falls
  // back to All when nothing is new so the inbox never opens on an empty list.
  const [tab, setTab] = useState<Tab>(() => (requests.some((r) => tabOf(r) === 'New') ? 'New' : 'All'));

  const withTab = useMemo(() => requests.map((r) => ({ r, tab: tabOf(r) })), [requests]);
  const counts = useMemo(() => {
    const c: Record<Tab, number> = { All: withTab.length, New: 0, Quoted: 0, Confirmed: 0, Closed: 0 };
    for (const { tab: t } of withTab) c[t] += 1;
    return c;
  }, [withTab]);

  const visible = tab === 'All' ? withTab : withTab.filter((x) => x.tab === tab);

  return (
    <div>
      <div className={styles.pills}>
        <Pills options={TABS} value={tab} onChange={setTab} counts={counts} />
      </div>

      {counts.New > 0 && (
        <div className={styles.notice}>
          <Info size={16} />
          <span className={styles.noticeText}>{QUOTES_COPY.slaNotice}</span>
        </div>
      )}

      {visible.length > 0 ? (
        <div className={styles.list}>
          {visible.map(({ r }) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </div>
      ) : (
        <EmptyBox icon={<Inbox size={22} className={styles.emptyIcon} />} title={QUOTES_COPY.emptyTitle} body={QUOTES_COPY.emptyBody} />
      )}
    </div>
  );
}

export default Component;
