import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { InvitationBlock } from '@features/invitation';
import { INVITATION_COPY as COPY } from '../constants';
import styles from '../styles.module.css';

export interface PersonalizeDialogProps {
  block: InvitationBlock;
  isSaving: boolean;
  onSave: (patch: { heading: string; body: string; hidden: boolean }) => void;
  onClose: () => void;
}

/**
 * Editing one of the customer's own sections.
 *
 * Only the three fields the API accepts from a customer are offered — the
 * section's name, icon and owner belong to the organizer who assembled it.
 */
export function PersonalizeDialog({ block, isSaving, onSave, onClose }: PersonalizeDialogProps) {
  const [heading, setHeading] = useState(block.heading);
  const [body, setBody] = useState(block.body);
  const [hidden, setHidden] = useState(block.hidden);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstField.current?.focus();
  }, []);

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
        aria-label={`${COPY.personalizeTitle}: ${block.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dialogHead}>
          <div>
            <h2 className={styles.dialogTitle}>{COPY.personalizeTitle}</h2>
            <p className={styles.dialogSub}>{block.title}</p>
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label={COPY.cancel}>
            <X size={18} />
          </button>
        </div>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>{COPY.fieldHeading}</span>
          <input
            ref={firstField}
            className={styles.input}
            value={heading}
            maxLength={120}
            placeholder={block.title}
            onChange={(e) => setHeading(e.target.value)}
          />
          <span className={styles.fieldHint}>{COPY.fieldHeadingHint}</span>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>{COPY.fieldBody}</span>
          <textarea
            className={styles.textarea}
            value={body}
            maxLength={2000}
            rows={5}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>

        <label className={styles.check}>
          <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
          <span>{COPY.fieldHide}</span>
        </label>

        <div className={styles.dialogActions}>
          <button type="button" className={styles.ghostBtn} onClick={onClose}>
            {COPY.cancel}
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={isSaving}
            onClick={() => onSave({ heading: heading.trim(), body: body.trim(), hidden })}
          >
            {isSaving ? COPY.saving : COPY.save}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PersonalizeDialog;
