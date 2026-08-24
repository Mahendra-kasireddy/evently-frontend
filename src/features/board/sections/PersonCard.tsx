import { initials } from '../constants';
import styles from '../board.module.css';

export interface PersonCardProps {
  name: string;
  /** What they are to the reader. */
  relation: string;
  /** Avatar tint; falls back to the role's own colour. */
  color?: string | undefined;
  square?: boolean;
}

/**
 * Who is on the other side of the board.
 *
 * Identity only. There is deliberately no "Message" action here: the chat
 * screen does not exist yet, and a button that goes nowhere is worse than no
 * button.
 */
export function PersonCard({ name, relation, color, square = false }: PersonCardProps) {
  return (
    <section className={styles.railCard}>
      <div className={styles.person}>
        <span
          className={styles.personAvatar}
          style={{ background: color ?? 'var(--color-navy)', borderRadius: square ? 12 : 999 }}
          aria-hidden="true"
        >
          {initials(name)}
        </span>
        <div className={styles.personText}>
          <strong>{name}</strong>
          <span>{relation}</span>
        </div>
      </div>
    </section>
  );
}

export default PersonCard;
