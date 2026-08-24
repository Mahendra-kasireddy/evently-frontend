import { useState } from 'react';
import { Check, Clock, Lock, MessageSquare } from 'lucide-react';
import { STATUS_META, TYPE_META, initials, when } from '../constants';
import type { Idea, IdeaPlanStatus } from '../types';
import styles from '../board.module.css';

export interface ReplyDraft {
  status: IdeaPlanStatus;
  text: string;
  approvalLabel: string;
}

export interface IdeaCardProps {
  idea: Idea;
  /** Whose screen this is — decides which action the card offers. */
  role: 'customer' | 'organizer';
  isApproving?: boolean;
  isReplying?: boolean;
  /** Customer only: sign off on a reply that asked for one. */
  onApprove?: (ideaId: string) => void;
  /** Organizer only: turn the post into a plan. */
  onReply?: (ideaId: string, draft: ReplyDraft) => void;
}

const STATUS_ORDER: IdeaPlanStatus[] = ['planned', 'in_progress', 'done'];

/**
 * One post, and whatever has happened to it since.
 *
 * The same card serves both sides: an item awaiting approval shows the customer
 * an approve action and shows the organizer that they are waiting on it, and
 * only the organizer gets the reply form — and only on the customer's posts,
 * since replying to your own update is not a thing.
 */
export function IdeaCard({
  idea,
  role,
  isApproving = false,
  isReplying = false,
  onApprove,
  onReply,
}: IdeaCardProps) {
  const isOrg = role === 'organizer';
  const meta = TYPE_META[idea.type] ?? TYPE_META.idea;
  const TypeIcon = meta.icon;
  /** Did the reader write this post? */
  const mine = isOrg ? idea.authorRole === 'organizer' : idea.authorRole === 'customer';

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ReplyDraft>({
    status: idea.reply?.status ?? 'planned',
    text: idea.reply?.text ?? '',
    approvalLabel: '',
  });

  const canReply = isOrg && !!onReply && idea.authorRole === 'customer';

  return (
    <article className={styles.card}>
      <header className={styles.cardHead}>
        <span
          className={styles.avatar}
          style={{
            background:
              idea.authorRole === 'organizer' ? 'var(--color-navy)' : 'var(--color-primary)',
          }}
          aria-hidden="true"
        >
          {initials(idea.authorName)}
        </span>
        <span className={styles.cardWho}>
          <span className={styles.cardName}>
            {idea.authorName || (idea.authorRole === 'organizer' ? 'Your organizer' : 'Customer')}
            {mine && <span className={styles.youTag}>You</span>}
          </span>
          <span className={styles.cardTime}>{when(idea.createdAt)}</span>
        </span>

        {idea.confidential && (
          <span className={styles.secret}>
            <Lock size={11} /> Kept private
          </span>
        )}
        <span className={`${styles.typeChip} ${styles[meta.cls] ?? ''}`}>
          <TypeIcon size={12} /> {meta.label}
        </span>
      </header>

      <p className={styles.text}>{idea.text}</p>

      {idea.images.length > 0 && (
        <div className={`${styles.images} ${idea.images.length > 1 ? styles.imagesMulti : ''}`}>
          {idea.images.map((img) => (
            <img key={img.url} src={img.url} alt={img.originalName || 'Reference photo'} />
          ))}
        </div>
      )}

      {idea.reply && (
        <div className={styles.reply}>
          <div className={styles.replyHead}>
            <strong>{isOrg ? 'Your plan' : 'Turned into a plan'}</strong>
            <span
              className={`${styles.statusChip} ${styles[STATUS_META[idea.reply.status]?.cls ?? ''] ?? ''}`}
            >
              <span className={styles.statusDot} aria-hidden="true" />
              {STATUS_META[idea.reply.status]?.label ?? idea.reply.status}
            </span>
          </div>
          <p className={styles.replyText}>{idea.reply.text}</p>
        </div>
      )}

      {/* An approval belongs to the customer; the organizer just waits on it. */}
      {idea.approval === 'pending' &&
        (isOrg ? (
          <p className={styles.awaitNote}>
            <Clock size={14} /> Awaiting their approval
            {idea.approvalLabel ? ` · ${idea.approvalLabel}` : ''}
          </p>
        ) : (
          <div className={styles.approval}>
            <p>{idea.approvalLabel || 'This needs your approval before the team can proceed.'}</p>
            <button
              type="button"
              className={styles.approveBtn}
              onClick={() => onApprove?.(idea.id)}
              disabled={isApproving}
            >
              <Check size={15} /> {isApproving ? 'Approving…' : 'Approve'}
            </button>
          </div>
        ))}

      {idea.approval === 'approved' && (
        <p className={styles.approved}>
          <Check size={14} /> {isOrg ? 'Approved by them' : 'You approved this'}
          {idea.approvedAt ? ` · ${when(idea.approvedAt)}` : ''}
        </p>
      )}

      {canReply &&
        (open ? (
          <div className={styles.replyForm}>
            <div className={styles.replyFormRow}>
              {STATUS_ORDER.map((s) => {
                const on = draft.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    className={`${styles.typeBtn} ${on ? (styles[STATUS_META[s].cls] ?? '') : ''}`}
                    style={
                      on ? undefined : { background: 'var(--color-bg)', color: 'var(--c-muted2)' }
                    }
                    onClick={() => setDraft((d) => ({ ...d, status: s }))}
                  >
                    {STATUS_META[s].label}
                  </button>
                );
              })}
            </div>
            <textarea
              className={styles.fieldArea}
              rows={3}
              maxLength={4000}
              value={draft.text}
              placeholder="What you are doing about this…"
              onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
            />
            <label className={styles.field} style={{ marginTop: 10, marginBottom: 0 }}>
              <span className={styles.fieldLabel}>Ask for their approval (optional)</span>
              <input
                className={styles.fieldInput}
                maxLength={400}
                value={draft.approvalLabel}
                placeholder="e.g. Approve the mandap décor mockup"
                onChange={(e) => setDraft((d) => ({ ...d, approvalLabel: e.target.value }))}
              />
            </label>
            <div className={styles.dialogActions}>
              <button type="button" className={styles.ghostBtn} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.postBtn}
                disabled={isReplying || !draft.text.trim()}
                onClick={() => {
                  onReply?.(idea.id, {
                    status: draft.status,
                    text: draft.text.trim(),
                    approvalLabel: draft.approvalLabel.trim(),
                  });
                  setOpen(false);
                }}
              >
                {isReplying ? 'Saving…' : idea.reply ? 'Update plan' : 'Save plan'}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className={styles.replyOpen} onClick={() => setOpen(true)}>
            <MessageSquare size={14} /> {idea.reply ? 'Update plan' : 'Reply with a plan'}
          </button>
        ))}
    </article>
  );
}

export default IdeaCard;
