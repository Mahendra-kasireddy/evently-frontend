import { useEffect } from 'react';
import { X } from 'lucide-react';
import { GuestPreview } from '@features/invitation';
import type {
  CardColour,
  InvitationBlock,
  InvitationDetails,
  InvitationSubEvent,
  InvitationTemplate,
} from '@features/invitation';
import { INVITATION_COPY as COPY } from '../constants';
import styles from '../styles.module.css';

export interface PreviewOverlayProps {
  details: InvitationDetails;
  blocks: InvitationBlock[];
  templates: InvitationTemplate[];
  subEvents: InvitationSubEvent[];
  cardPalette: CardColour[];
  defaultSubEventMinutes: number;
  fallbackName: string;
  onClose: () => void;
}

/**
 * The guest view at full size.
 *
 * An overlay on the review screen rather than a route of its own: it is the same
 * render as the rail's phone, just bigger, so giving it a URL would only add a
 * second address for one piece of state — and closing it has to come back here.
 */
export function PreviewOverlay({
  details,
  blocks,
  templates,
  subEvents,
  cardPalette,
  defaultSubEventMinutes,
  fallbackName,
  onClose,
}: PreviewOverlayProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.previewSheet}
        role="dialog"
        aria-modal="true"
        aria-label={COPY.previewTitle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.previewBar}>
          <div>
            <strong className={styles.previewBarTitle}>{COPY.previewTitle}</strong>
            <span className={styles.previewBarSub}>{COPY.previewSub}</span>
          </div>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onClose}
            aria-label={COPY.previewClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className={styles.previewBody}>
          <GuestPreview
            details={details}
            blocks={blocks}
            templates={templates}
            subEvents={subEvents}
            cardPalette={cardPalette}
            defaultSubEventMinutes={defaultSubEventMinutes}
            fallbackName={fallbackName}
          />
        </div>
      </div>
    </div>
  );
}

export default PreviewOverlay;
