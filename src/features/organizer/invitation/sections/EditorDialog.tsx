import { useEffect, useId, useState } from 'react';
import { X } from 'lucide-react';
import { Btn } from '@shared/partner';
import { INVITATION_COPY as COPY, HEADER_BLOCK } from '../constants';
import type { InvitationBlock, InvitationDetails, InvitationTemplate } from '../types';
import type { SaveBlockPatch } from '../hooks';
import styles from '../styles.module.css';

export interface EditorDialogProps {
  /** The section being edited, or undefined when adding a new one. */
  block: InvitationBlock | undefined;
  details: InvitationDetails;
  templates: InvitationTemplate[];
  isSaving: boolean;
  onSave: (patch: SaveBlockPatch) => void;
  onRemove: ((key: string) => void) | undefined;
  onClose: () => void;
}

/**
 * The section editor. The header section additionally exposes the event-level
 * fields the whole invitation draws from (names, date, venue, message), which
 * is where the guest hero gets its content.
 */
export function EditorDialog({
  block,
  details,
  templates,
  isSaving,
  onSave,
  onRemove,
  onClose,
}: EditorDialogProps) {
  const id = useId();
  const isHeader = block?.key === HEADER_BLOCK;

  // Mounted fresh per open (keyed by section in `Component`), so the initial
  // state below is always the section the organizer just clicked.
  const [title, setTitle] = useState(block?.title ?? '');
  const [heading, setHeading] = useState(block?.heading ?? '');
  const [body, setBody] = useState(block?.body ?? '');
  const [draft, setDraft] = useState<InvitationDetails>(details);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = <K extends keyof InvitationDetails>(key: K, value: InvitationDetails[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      heading,
      body,
      ...(isHeader ? { details: draft } : {}),
    });
  };

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onSubmit={submit}
      >
        <header className={styles.dialogHead}>
          <div>
            <div className={styles.dialogEyebrow}>
              {block ? COPY.editorTitle : COPY.newTitle}
            </div>
            <h2 className={styles.dialogTitle} id={`${id}-title`}>
              {block?.title ?? COPY.newTitle}
            </h2>
          </div>
          <button type="button" className={styles.dialogClose} onClick={onClose} aria-label={COPY.cancel}>
            <X size={18} />
          </button>
        </header>

        <div className={styles.dialogBody}>
          {block?.owner === 'customer' && <p className={styles.dialogNote}>{COPY.customerNote}</p>}

          <label className={styles.field}>
            <span>{COPY.fieldTitle}</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
          </label>
          <label className={styles.field}>
            <span>{COPY.fieldHeading}</span>
            <input value={heading} onChange={(e) => setHeading(e.target.value)} maxLength={120} />
          </label>
          <label className={styles.field}>
            <span>{COPY.fieldBody}</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={600} />
          </label>

          {isHeader && (
            <>
              <h3 className={styles.fieldGroup}>{COPY.fieldsTitle}</h3>
              <label className={styles.field}>
                <span>{COPY.template}</span>
                <select value={draft.template} onChange={(e) => set('template', e.target.value)}>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>{COPY.eyebrow}</span>
                <input
                  value={draft.eyebrow}
                  onChange={(e) => set('eyebrow', e.target.value)}
                  maxLength={80}
                />
              </label>
              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span>{COPY.hostOne}</span>
                  <input
                    value={draft.hostOne}
                    onChange={(e) => set('hostOne', e.target.value)}
                    maxLength={60}
                  />
                </label>
                <label className={styles.field}>
                  <span>{COPY.joiner}</span>
                  <input
                    value={draft.joiner}
                    onChange={(e) => set('joiner', e.target.value)}
                    maxLength={20}
                  />
                </label>
                <label className={styles.field}>
                  <span>{COPY.hostTwo}</span>
                  <input
                    value={draft.hostTwo}
                    onChange={(e) => set('hostTwo', e.target.value)}
                    maxLength={60}
                  />
                </label>
              </div>
              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span>{COPY.eventDate}</span>
                  <input
                    type="date"
                    value={draft.eventDate}
                    onChange={(e) => set('eventDate', e.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>{COPY.eventTime}</span>
                  <input
                    type="time"
                    value={draft.eventTime}
                    onChange={(e) => set('eventTime', e.target.value)}
                  />
                </label>
              </div>
              <label className={styles.field}>
                <span>{COPY.venueName}</span>
                <input
                  value={draft.venueName}
                  onChange={(e) => set('venueName', e.target.value)}
                  maxLength={120}
                />
              </label>
              <label className={styles.field}>
                <span>{COPY.venueAddress}</span>
                <input
                  value={draft.venueAddress}
                  onChange={(e) => set('venueAddress', e.target.value)}
                  maxLength={240}
                />
              </label>
              <label className={styles.field}>
                <span>{COPY.message}</span>
                <textarea
                  value={draft.message}
                  onChange={(e) => set('message', e.target.value)}
                  rows={3}
                  maxLength={500}
                />
              </label>
            </>
          )}
        </div>

        <footer className={styles.dialogFoot}>
          {block && onRemove && (
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => onRemove(block.key)}
              disabled={isSaving}
            >
              {COPY.remove}
            </button>
          )}
          <Btn kind="outline" sm onClick={onClose} className={styles.footSpacer}>
            {COPY.cancel}
          </Btn>
          <Btn kind="primary" sm type="submit" disabled={isSaving}>
            {isSaving ? COPY.saving : block ? COPY.save : COPY.add}
          </Btn>
        </footer>
      </form>
    </div>
  );
}

export default EditorDialog;
