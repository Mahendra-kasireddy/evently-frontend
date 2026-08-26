import { Check, EyeOff, Lock, Pencil, Share2 } from 'lucide-react';
import { BLOCK_ICON, FALLBACK_BLOCK_ICON } from '@features/invitation';
import type { InvitationBlock } from '@features/invitation';
import { INVITATION_COPY as COPY, OWNER_BADGE } from '../constants';
import styles from '../styles.module.css';

export interface SectionRowProps {
  block: InvitationBlock;
  /** How many of this section's asks are still open with the organizer. */
  pendingRequests: number;
  /**
   * Sharing only appears once the customer has approved: before that the
   * wording is still being argued over, and a guest link would publish
   * something nobody has signed off.
   */
  canShare: boolean;
  onPersonalize: () => void;
  onRequestChange: () => void;
  onShare: () => void;
}

/**
 * One section of the invitation.
 *
 * Which action the row offers is decided by the section's owner, exactly as the
 * server records it: the customer edits their own sections in place, and asks
 * the organizer about the ones the organizer manages.
 */
export function SectionRow({
  block,
  pendingRequests,
  canShare,
  onPersonalize,
  onRequestChange,
  onShare,
}: SectionRowProps) {
  const Icon = BLOCK_ICON[block.icon] ?? FALLBACK_BLOCK_ICON;
  const isOrg = block.owner === 'organizer';

  return (
    <li className={`${styles.row} ${block.hidden ? styles.rowOff : ''}`}>
      <span className={`${styles.rowIcon} ${isOrg ? styles.rowIconOrg : styles.rowIconCust}`}>
        <Icon size={19} />
      </span>

      <span className={styles.rowText}>
        <span className={styles.rowTop}>
          <span className={styles.rowTitle}>{block.title}</span>
          <span className={`${styles.badge} ${isOrg ? styles.badgeOrg : styles.badgeCust}`}>
            {isOrg ? <Lock size={11} /> : <Pencil size={11} />}
            {OWNER_BADGE[block.owner]}
          </span>
        </span>
        <span className={`${styles.rowState} ${block.hidden ? styles.rowStateOff : ''}`}>
          {block.hidden ? <EyeOff size={12} /> : <Check size={12} />}
          {block.hidden ? COPY.hidden : COPY.ready}
        </span>
        {pendingRequests > 0 && (
          <span className={styles.rowPending}>{COPY.requestPending(pendingRequests)}</span>
        )}
      </span>

      {/*
        A hidden section has nothing to show a guest, so it cannot be shared —
        the same rule the guest view enforces server-side.
      */}
      {canShare && !block.hidden && (
        <button
          type="button"
          className={styles.shareBtn}
          onClick={onShare}
          aria-label={`${COPY.share}: ${block.title}`}
        >
          <Share2 size={14} /> {COPY.share}
        </button>
      )}

      {isOrg ? (
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={onRequestChange}
          aria-label={`${COPY.requestChange}: ${block.title}`}
        >
          {COPY.requestChange}
        </button>
      ) : (
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onPersonalize}
          aria-label={`${COPY.personalize}: ${block.title}`}
        >
          <Pencil size={14} /> {COPY.personalize}
        </button>
      )}
    </li>
  );
}

export default SectionRow;
