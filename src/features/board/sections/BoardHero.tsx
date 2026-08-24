import { Sparkles } from 'lucide-react';
import type { IdeaCounts } from '../types';
import styles from '../board.module.css';

export interface BoardHeroProps {
  /** Who is reading — only the wording differs. */
  role: 'customer' | 'organizer';
  /** The other party's name, used in the sentence. */
  counterpartName: string;
  counts: IdeaCounts;
}

/**
 * The board's banner. All three figures are the server's own counts, so this
 * cannot claim more activity than the feed below it contains.
 */
export function BoardHero({ role, counterpartName, counts }: BoardHeroProps) {
  const isOrg = role === 'organizer';

  return (
    <section className={styles.hero}>
      <span className={styles.blob} aria-hidden />
      <div className={styles.heroInner}>
        <div className={styles.heroText}>
          <span className={styles.pill}>
            <Sparkles size={13} /> IDEAS BOARD
          </span>
          <h1 className={styles.heroTitle}>Plan your day, together</h1>
          <p className={styles.heroSub}>
            {isOrg
              ? `Every idea ${counterpartName} shares lands here. Note it, turn it into a task, and keep them in the loop — they only approve.`
              : `Share how you imagine your day. ${counterpartName} turns each idea into a real plan — you just review and approve.`}
          </p>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <strong>{counts.shared}</strong>
            <span>{counts.shared === 1 ? 'Idea shared' : 'Ideas shared'}</span>
          </div>
          <div className={`${styles.stat} ${styles.statPlanned}`}>
            <strong>{counts.planned}</strong>
            <span>Planned</span>
          </div>
          <div className={`${styles.stat} ${styles.statAwaiting}`}>
            <strong>{counts.awaitingApproval}</strong>
            <span>{isOrg ? 'Awaiting them' : 'Awaiting you'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BoardHero;
