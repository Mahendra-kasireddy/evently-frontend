import { useMemo, useState } from 'react';
import { ChevronLeft, MessageSquare, Sparkles } from 'lucide-react';
import { matchesFilter } from './constants';
import { AwaitingCard } from './sections/AwaitingCard';
import { BoardComposer } from './sections/BoardComposer';
import { BoardFilters } from './sections/BoardFilters';
import { BoardHero } from './sections/BoardHero';
import { IdeaCard, type ReplyDraft } from './sections/IdeaCard';
import { PersonCard } from './sections/PersonCard';
import { ProgressCard } from './sections/ProgressCard';
import { VisionCard } from './sections/VisionCard';
import { VisionDialog, type VisionPatch } from './sections/VisionDialog';
import type { BoardFilter, DraftPost, IdeaBoard } from './types';
import styles from './board.module.css';

export interface BoardScreenProps {
  role: 'customer' | 'organizer';
  board: IdeaBoard;
  /** The reader's own name, for the composer avatar. */
  authorName: string;
  /** The other party's name. */
  counterpartName: string;
  /** Always the organizer's name, whichever side is reading. */
  organizerName: string;
  /** Where the back control goes, and what it is called. */
  backLabel: string;
  eventTitle: string;
  eventDate?: string | undefined;

  isPosting: boolean;
  isApproving?: boolean;
  isReplying?: boolean;
  isSavingVision?: boolean;

  onPost: (draft: DraftPost) => void;
  onApprove?: (ideaId: string) => void;
  onReply?: (ideaId: string, draft: ReplyDraft) => void;
  onSaveVision?: (patch: VisionPatch) => void;
  onBack: () => void;
}

/**
 * The ideas & planning board (C-12), rendered for whichever side is reading.
 *
 * One implementation serves both roles because it is one conversation: the same
 * posts, counts and vision, with the actions each side is actually allowed. The
 * design's customer/organizer switch is a presentation device — here the role
 * comes from who is signed in, so nobody can flip into the other party's view.
 */
export function BoardScreen({
  role,
  board,
  authorName,
  counterpartName,
  organizerName,
  backLabel,
  eventTitle,
  eventDate,
  isPosting,
  isApproving = false,
  isReplying = false,
  isSavingVision = false,
  onPost,
  onApprove,
  onReply,
  onSaveVision,
  onBack,
}: BoardScreenProps) {
  const [filter, setFilter] = useState<BoardFilter>('all');
  const [editingVision, setEditingVision] = useState(false);
  const { items, counts, vision } = board;

  const visible = useMemo(() => items.filter((i) => matchesFilter(i, filter)), [items, filter]);
  const awaiting = useMemo(() => items.filter((i) => i.approval === 'pending'), [items]);

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <button type="button" className={styles.back} onClick={onBack}>
            <ChevronLeft size={16} /> {backLabel}
          </button>
          <span className={styles.topbarMeta}>{eventTitle}</span>
        </div>
      </div>

      <div className={styles.container}>
        <BoardHero role={role} counterpartName={counterpartName} counts={counts} />

        <div className={styles.body}>
          <div className={styles.main}>
            <BoardComposer
              role={role}
              authorName={authorName}
              counterpartName={counterpartName}
              isPosting={isPosting}
              onPost={onPost}
            />

            <BoardFilters value={filter} items={items} onChange={setFilter} />

            {visible.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>
                  {items.length === 0 ? <Sparkles size={24} /> : <MessageSquare size={24} />}
                </span>
                <h2>{items.length === 0 ? 'Nothing here yet' : 'Nothing in this filter'}</h2>
                <p>
                  {items.length === 0
                    ? role === 'organizer'
                      ? `Post the first update, or wait for ${counterpartName} to share an idea.`
                      : `Share the first one — a theme, a must-have, a photo you love. ${counterpartName} will turn it into a plan and reply here.`
                    : 'Try another filter, or post something new.'}
                </p>
              </div>
            ) : (
              <div className={styles.feed}>
                {visible.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    role={role}
                    isApproving={isApproving}
                    isReplying={isReplying}
                    {...(onApprove ? { onApprove } : {})}
                    {...(onReply ? { onReply } : {})}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className={styles.rail}>
            <VisionCard
              vision={vision}
              role={role}
              organizerName={organizerName}
              {...(role === 'organizer' && onSaveVision
                ? { onEdit: () => setEditingVision(true) }
                : {})}
            />
            <ProgressCard counts={counts} eventDate={eventDate} />
            <AwaitingCard items={awaiting} role={role} onReview={() => setFilter('awaiting')} />
            <PersonCard
              name={counterpartName}
              relation={role === 'organizer' ? 'Your client for this event' : 'Your organizer'}
              color={role === 'organizer' ? 'var(--color-primary)' : 'var(--color-navy)'}
              square={role === 'customer'}
            />
          </aside>
        </div>
      </div>

      {editingVision && onSaveVision && (
        <VisionDialog
          vision={vision}
          isSaving={isSavingVision}
          onSave={(patch) => {
            onSaveVision(patch);
            setEditingVision(false);
          }}
          onClose={() => setEditingVision(false)}
        />
      )}
    </main>
  );
}

export default BoardScreen;
