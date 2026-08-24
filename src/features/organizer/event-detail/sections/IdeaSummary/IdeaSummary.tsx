import { ChevronRight, Clock, Sparkles } from 'lucide-react';
import { Card, Btn } from '@shared/partner';
import type { IdeaCounts } from '@features/board';
import styles from './IdeaSummary.module.css';

export interface IdeaSummaryProps {
  counts: IdeaCounts;
  clientName: string;
  onOpen: () => void;
}

/**
 * The ideas board, as it appears on the event screen: the three real counts and
 * a way in.
 *
 * The feed itself lives on its own screen — it is a conversation, and it needs
 * the room. Keeping only a summary here means there is one implementation of the
 * board rather than two that can drift.
 */
export function IdeaSummary({ counts, clientName, onOpen }: IdeaSummaryProps) {
  const nothingYet = counts.shared === 0 && counts.planned === 0;

  return (
    <Card padding="16px 18px">
      <div className={styles.row}>
        <span className={styles.icon}>
          <Sparkles size={20} />
        </span>
        <div className={styles.text}>
          <strong>Ideas &amp; planning board</strong>
          {nothingYet ? (
            <span>{clientName} hasn’t shared an idea yet — post an update to get them started.</span>
          ) : (
            <span>
              {counts.shared} shared · {counts.planned} planned
              {counts.awaitingApproval > 0 ? ` · ${counts.awaitingApproval} awaiting them` : ''}
            </span>
          )}
        </div>
        <Btn kind="outline" sm icon={<ChevronRight size={14} />} onClick={onOpen}>
          Open board
        </Btn>
      </div>

      {counts.awaitingApproval > 0 && (
        <p className={styles.note}>
          <Clock size={13} />
          {counts.awaitingApproval === 1
            ? '1 item is waiting on their approval'
            : `${counts.awaitingApproval} items are waiting on their approval`}
        </p>
      )}
    </Card>
  );
}

export default IdeaSummary;
