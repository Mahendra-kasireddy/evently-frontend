import type { ReactNode } from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  /** Icon shown in the badge. Defaults to an inbox. */
  icon?: LucideIcon;
  title: string;
  message?: string;
  /** Optional call-to-action button. */
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

/**
 * Branded empty state — badge icon + title + message + optional action. Used
 * wherever a data-driven list can legitimately have zero items (no organizers,
 * no plans, no drafts, no quotes) so screens never render blank.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <div className={styles.empty} role="status">
      <span className={styles.icon}>
        <Icon size={24} />
      </span>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.msg}>{message}</p>}
      {actionLabel && onAction && (
        <button type="button" className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {children}
    </div>
  );
}
