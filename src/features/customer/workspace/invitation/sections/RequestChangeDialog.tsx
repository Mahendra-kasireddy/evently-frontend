import { useEffect, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import { INVITATION_COPY as COPY } from '../constants';
import styles from '../styles.module.css';

export interface RequestChangeDialogProps {
  /** The section the ask is about; absent when it is about the whole invitation. */
  blockTitle?: string | undefined;
  isSending: boolean;
  onSend: (note: string) => void;
  onClose: () => void;
}

/** Asking the organizer to change a section the organizer owns. */
export function RequestChangeDialog({
  blockTitle,
  isSending,
  onSend,
  onClose,
}: RequestChangeDialogProps) {
  const [note, setNote] = useState('');
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    field.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const trimmed = note.trim();

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={COPY.requestTitle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dialogHead}>
          <div>
            <h2 className={styles.dialogTitle}>{COPY.requestTitle}</h2>
            <p className={styles.dialogSub}>{blockTitle ?? COPY.requestSubAll}</p>
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label={COPY.cancel}>
            <X size={18} />
          </button>
        </div>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>{COPY.requestField}</span>
          <textarea
            ref={field}
            className={styles.textarea}
            value={note}
            rows={5}
            maxLength={2000}
            placeholder={COPY.requestPlaceholder}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <div className={styles.dialogActions}>
          <button type="button" className={styles.ghostBtn} onClick={onClose}>
            {COPY.cancel}
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={isSending || trimmed.length < 3}
            onClick={() => onSend(trimmed)}
          >
            <Send size={14} /> {isSending ? COPY.requestSending : COPY.requestSend}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequestChangeDialog;
