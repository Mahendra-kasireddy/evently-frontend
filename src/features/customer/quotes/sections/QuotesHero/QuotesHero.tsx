import { ChevronLeft } from 'lucide-react';
import styles from './QuotesHero.module.css';

export interface QuotesHeroProps {
  eyebrow: string;
  heading: string;
  subtitle: string;
  /**
   * Returns to My Events. Omit it when the page already carries a breadcrumb
   * trail with its own back control — two back buttons stacked one above the
   * other is noise, not reassurance.
   */
  onBack?: (() => void) | undefined;
  backLabel?: string | undefined;
}

/**
 * Header for the comparison view. Any back control here is labelled rather than a
 * bare chevron: this view is also reachable from a notification or a shared link,
 * where an unlabelled arrow driving a history-based `navigate(-1)` left the
 * customer with no idea where "back" would go.
 */
export function QuotesHero({
  eyebrow,
  heading,
  subtitle,
  onBack,
  backLabel = 'My Events',
}: QuotesHeroProps) {
  return (
    <section className={styles.hero}>
      <span className={styles.circle} aria-hidden /><span className={styles.circle2} aria-hidden />
      <div className={styles.content}>
        {onBack && (
          <button type="button" className={styles.back} onClick={onBack}>
            <ChevronLeft size={16} /> {backLabel}
          </button>
        )}
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h1 className={styles.heading}>{heading}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </section>
  );
}
