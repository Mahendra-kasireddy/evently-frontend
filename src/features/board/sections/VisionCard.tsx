import { Lock, Pencil } from 'lucide-react';
import { VISION_SLOTS } from '../constants';
import type { BoardVision } from '../types';
import styles from '../board.module.css';

export interface VisionCardProps {
  vision: BoardVision;
  role: 'customer' | 'organizer';
  /** Who wrote it — named in the subtitle on the customer's side. */
  organizerName: string;
  /** Organizer only: open the editor. */
  onEdit?: () => void;
}

/**
 * What the organizer understood the event to be.
 *
 * Written by the organizer, read back by the customer — which is the whole
 * point of it: it is how the customer sees whether they were heard. Slots the
 * organizer has not filled in say so rather than showing a plausible guess, and
 * before anything is captured the card explains that instead of standing empty.
 */
export function VisionCard({ vision, role, organizerName, onEdit }: VisionCardProps) {
  const isOrg = role === 'organizer';

  return (
    <section className={styles.railCard}>
      <h2 className={styles.railTitle}>{isOrg ? 'Event vision' : 'Your event vision'}</h2>
      <p className={styles.railSub}>
        {isOrg
          ? 'The short version you are working to. Your customer reads this back.'
          : `What ${organizerName} captured from your ideas.`}
      </p>

      {!vision.captured ? (
        <p className={styles.visionEmpty}>
          {isOrg
            ? 'Nothing captured yet. Summarise the theme, vibe, surprise and food as they become clear.'
            : `${organizerName} hasn’t summarised your event yet. It will appear here as they work through your ideas.`}
        </p>
      ) : (
        VISION_SLOTS.map((slot) => {
          const value = vision[slot.key];
          const Icon = slot.icon;
          // A slot with nothing in it is shown as outstanding on the organizer's
          // own screen, and simply left out of the customer's read-back.
          if (!value && !isOrg) return null;
          return (
            <div key={slot.key} className={styles.vRow}>
              <span className={styles.vIcon}>
                <Icon size={15} />
              </span>
              <span className={styles.vText}>
                <span className={styles.vLabel}>{slot.label}</span>
                {value ? (
                  <span className={styles.vValue}>{value}</span>
                ) : (
                  <span className={styles.vEmpty}>Not captured yet</span>
                )}
              </span>
              {slot.key === 'surprise' && value && vision.surpriseConfidential && (
                <Lock size={13} className={styles.vLock} aria-label="Kept private" />
              )}
            </div>
          );
        })
      )}

      {isOrg && onEdit && (
        <button type="button" className={styles.visionEdit} onClick={onEdit}>
          <Pencil size={13} /> {vision.captured ? 'Update vision' : 'Capture the vision'}
        </button>
      )}
    </section>
  );
}

export default VisionCard;
