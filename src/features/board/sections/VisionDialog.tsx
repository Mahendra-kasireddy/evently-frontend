import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { VISION_SLOTS } from '../constants';
import type { BoardVision } from '../types';
import styles from '../board.module.css';

export type VisionPatch = Pick<
  BoardVision,
  'theme' | 'vibe' | 'surprise' | 'food' | 'surpriseConfidential'
>;

export interface VisionDialogProps {
  vision: BoardVision;
  isSaving: boolean;
  onSave: (patch: VisionPatch) => void;
  onClose: () => void;
}

const PLACEHOLDER: Record<string, string> = {
  theme: 'e.g. Marigold & maroon',
  vibe: 'e.g. Traditional + fun',
  surprise: 'e.g. Drone petal shower',
  food: 'e.g. Veg-forward + live counters',
};

/**
 * The organizer writing the event down in four lines.
 *
 * Every field can be left blank — the customer's card omits what is not filled
 * in, so a half-captured vision is honest rather than broken.
 */
export function VisionDialog({ vision, isSaving, onSave, onClose }: VisionDialogProps) {
  const [form, setForm] = useState<VisionPatch>({
    theme: vision.theme,
    vibe: vision.vibe,
    surprise: vision.surprise,
    food: vision.food,
    surpriseConfidential: vision.surpriseConfidential,
  });

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
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Capture the event vision"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dialogHead}>
          <div>
            <h2 className={styles.dialogTitle}>Capture the event vision</h2>
            <p className={styles.dialogSub}>
              Your customer reads this back on their own board — keep it in their words.
            </p>
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {VISION_SLOTS.map((slot) => (
          <label key={slot.key} className={styles.field}>
            <span className={styles.fieldLabel}>{slot.label}</span>
            <input
              className={styles.fieldInput}
              maxLength={120}
              value={form[slot.key]}
              placeholder={PLACEHOLDER[slot.key] ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, [slot.key]: e.target.value }))}
            />
          </label>
        ))}

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={form.surpriseConfidential}
            onChange={(e) => setForm((f) => ({ ...f, surpriseConfidential: e.target.checked }))}
          />
          <span>Keep the surprise off anything they share onward</span>
        </label>

        <div className={styles.dialogActions}>
          <button type="button" className={styles.ghostBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.postBtn}
            disabled={isSaving}
            onClick={() =>
              onSave({
                theme: form.theme.trim(),
                vibe: form.vibe.trim(),
                surprise: form.surprise.trim(),
                food: form.food.trim(),
                surpriseConfidential: form.surpriseConfidential,
              })
            }
          >
            {isSaving ? 'Saving…' : 'Save vision'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VisionDialog;
