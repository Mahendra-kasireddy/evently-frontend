import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, ExternalLink, Send, UserPlus, X } from 'lucide-react';
import { displayPhone, parseGuestPhone, PHONE_REJECTION_MESSAGE } from '../guestPhone';
import { INVITATION_COPY as COPY } from '../constants';
import type { Guest, ShareOutcome, ShareResult } from '../guestService';
import styles from '../styles.module.css';

export interface ShareDialogProps {
  /** The section being shared; undefined means the complete invitation. */
  sectionKey: string | undefined;
  sectionTitle: string;
  guests: Guest[];
  isLoadingGuests: boolean;
  isSending: boolean;
  onShare: (
    guestIds: string[],
    newGuest: { name: string; phone: string } | null,
  ) => Promise<ShareResult | null>;
  onClose: () => void;
}

/** Where the dialog is in the pick → confirm → sent sequence. */
type Stage = 'pick' | 'confirm' | 'done';

/**
 * Choosing who to send the invitation to, and sending it.
 *
 * Three steps rather than one, because the spec asks for the guest's details to
 * be shown back before anything is sent — a typo in a phone number is invisible
 * inside an input but obvious on a confirmation line, and once a WhatsApp
 * message is gone it cannot be recalled.
 *
 * Built from this screen's own dialog conventions (`.dialogHead`, `.field` +
 * `.fieldLabel` + `.input`, `.dialogActions`) rather than the organizer
 * builder's, which name the same parts differently — mixing the two is what
 * left this dialog unstyled the first time.
 */
export function ShareDialog({
  sectionKey,
  sectionTitle,
  guests,
  isLoadingGuests,
  isSending,
  onShare,
  onClose,
}: ShareDialogProps) {
  const [stage, setStage] = useState<Stage>('pick');
  const [selected, setSelected] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [outcomes, setOutcomes] = useState<ShareOutcome[]>([]);
  const nameField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggle = (guestId: string) => {
    setError('');
    setSelected((prev) =>
      prev.includes(guestId) ? prev.filter((g) => g !== guestId) : [...prev, guestId],
    );
  };

  const startAdding = () => {
    setAdding(true);
    setError('');
    // Focused here rather than in an effect: the field only ever appears as a
    // direct result of this click.
    window.requestAnimationFrame(() => nameField.current?.focus());
  };

  /** The typed-in guest, once it survives validation. Null when none is being added. */
  const newGuest = adding ? { name: name.trim(), phone: phone.trim() } : null;

  /**
   * Every rejection the spec lists, answered before a request is made — except
   * the ones only the server can know, which come back from it. The same parse
   * runs on both sides so the two can never disagree about what a valid number
   * is.
   */
  const validate = (): string => {
    if (adding) {
      if (!name.trim()) return COPY.shareNeedName;
      const parsed = parseGuestPhone(phone);
      if (!parsed.ok) return PHONE_REJECTION_MESSAGE[parsed.reason ?? 'not_a_number'];

      const clash = guests.find((g) => g.phone === parsed.e164);
      if (clash) {
        return selected.includes(clash.id)
          ? COPY.shareAlreadySelected(clash.name)
          : COPY.shareAlreadyExists(clash.name);
      }
    }
    if (selected.length === 0 && !adding) return COPY.shareNeedGuest;
    return '';
  };

  const goConfirm = () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setStage('confirm');
  };

  const send = async () => {
    const result = await onShare(selected, newGuest);
    if (!result) {
      setError(COPY.shareFailed);
      setStage('pick');
      return;
    }
    setOutcomes(result.results);
    setStage('done');

    /*
     * Handoff mode: the server has produced a wa.me link per guest but nothing
     * has been sent — WhatsApp opens with the message ready and the customer
     * presses send. Only the first is opened automatically; browsers block a
     * burst of popups, and the rest are offered as links below.
     */
    const first = result.results.find((r) => r.handoffUrl);
    if (first?.handoffUrl) window.open(first.handoffUrl, '_blank', 'noopener,noreferrer');
  };

  const title = sectionKey ? COPY.shareSectionTitle(sectionTitle) : COPY.shareAllTitle;

  /** Who this send is actually going to, for the confirmation step. */
  const chosen = guests.filter((g) => selected.includes(g.id));

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dialogHead}>
          <div>
            <h2 className={styles.dialogTitle}>{title}</h2>
            <p className={styles.dialogSub}>
              {stage === 'confirm' ? COPY.shareConfirmIntro : COPY.shareIntro}
            </p>
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label={COPY.close}>
            <X size={18} />
          </button>
        </div>

        {stage === 'pick' && (
          <div className={styles.shareBody}>
            {isLoadingGuests ? (
              <p className={styles.shareEmpty}>{COPY.shareLoading}</p>
            ) : guests.length === 0 ? (
              <p className={styles.shareEmpty}>{COPY.shareNoGuests}</p>
            ) : (
              <ul className={styles.guestList}>
                {guests.map((guest) => {
                  const already = sectionKey
                    ? guest.sharedSections.includes(sectionKey)
                    : guest.sharedSections.includes('');
                  return (
                    <li key={guest.id}>
                      <label className={styles.guestRow}>
                        <input
                          type="checkbox"
                          checked={selected.includes(guest.id)}
                          onChange={() => toggle(guest.id)}
                        />
                        <span className={styles.guestText}>
                          <span className={styles.guestName}>{guest.name}</span>
                          <span className={styles.guestPhone}>{guest.phoneDisplay}</span>
                        </span>
                        {already && <span className={styles.guestFlag}>{COPY.shareAlreadySent}</span>}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            {adding ? (
              <div className={styles.newGuest}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>{COPY.shareGuestName}</span>
                  <input
                    ref={nameField}
                    className={styles.input}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    maxLength={80}
                    placeholder="Rahul"
                  />
                </label>
                <label className={styles.fieldLast}>
                  <span className={styles.fieldLabel}>{COPY.shareGuestPhone}</span>
                  <input
                    className={styles.input}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setError('');
                    }}
                    inputMode="tel"
                    maxLength={24}
                    placeholder="9876543210"
                  />
                  <span className={styles.fieldHint}>{COPY.sharePhoneHint}</span>
                </label>
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() => {
                    setAdding(false);
                    setName('');
                    setPhone('');
                    setError('');
                  }}
                >
                  {COPY.shareDiscardGuest}
                </button>
              </div>
            ) : (
              <button type="button" className={styles.addGuestBtn} onClick={startAdding}>
                <UserPlus size={15} />
                {COPY.shareAddGuest}
              </button>
            )}
          </div>
        )}

        {stage === 'confirm' && (
          <div className={styles.shareBody}>
            <ul className={styles.confirmList}>
              {chosen.map((guest) => (
                <li key={guest.id} className={styles.confirmRow}>
                  <span className={styles.guestName}>{guest.name}</span>
                  <span className={styles.guestPhone}>{guest.phoneDisplay}</span>
                </li>
              ))}
              {newGuest && (
                <li className={styles.confirmRow}>
                  <span className={styles.guestName}>{newGuest.name}</span>
                  {/* Grouped the same way the stored guests are, so the two
                      lines of this list do not read as different formats. */}
                  <span className={styles.guestPhone}>
                    {displayPhone(parseGuestPhone(newGuest.phone).e164) || newGuest.phone}
                  </span>
                  <span className={styles.guestFlag}>{COPY.shareNewGuest}</span>
                </li>
              )}
            </ul>
            <p className={styles.shareWhat}>
              {sectionKey ? COPY.shareConfirmSection(sectionTitle) : COPY.shareConfirmAll}
            </p>
            {/*
              Said plainly rather than implied: nothing here can check whether a
              number is on WhatsApp, and claiming otherwise would be the one
              thing the spec explicitly forbids.
            */}
            <p className={styles.shareCaveat}>
              <AlertTriangle size={14} />
              <span>{COPY.shareWhatsappCaveat}</span>
            </p>
          </div>
        )}

        {stage === 'done' && (
          <div className={styles.shareBody}>
            <ul className={styles.confirmList}>
              {outcomes.map((outcome) => (
                <li key={outcome.guest.id} className={styles.confirmRow}>
                  <span className={styles.guestName}>{outcome.guest.name}</span>
                  <span className={styles.guestPhone}>{outcome.guest.phoneDisplay}</span>
                  {outcome.status === 'failed' ? (
                    <span className={styles.outcomeBad}>
                      <AlertTriangle size={13} /> {outcome.error || COPY.shareFailed}
                    </span>
                  ) : outcome.status === 'sent' ? (
                    <span className={styles.outcomeOk}>
                      <Check size={13} /> {COPY.shareSent}
                    </span>
                  ) : (
                    <a
                      className={styles.outcomeLink}
                      href={outcome.handoffUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={13} /> {COPY.shareOpenWhatsapp}
                    </a>
                  )}
                </li>
              ))}
            </ul>
            {outcomes.some((o) => o.status === 'handed_off') && (
              <p className={styles.shareCaveat}>
                <AlertTriangle size={14} />
                <span>{COPY.shareHandoffNote}</span>
              </p>
            )}
          </div>
        )}

        {error && (
          <p className={styles.shareError} role="alert">
            {error}
          </p>
        )}

        <div className={styles.dialogActions}>
          {stage === 'pick' && (
            <>
              <button type="button" className={styles.ghostBtn} onClick={onClose}>
                {COPY.cancel}
              </button>
              <button type="button" className={styles.primaryBtn} onClick={goConfirm}>
                {COPY.shareContinue}
              </button>
            </>
          )}
          {stage === 'confirm' && (
            <>
              <button type="button" className={styles.ghostBtn} onClick={() => setStage('pick')}>
                {COPY.back}
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => void send()}
                disabled={isSending}
              >
                <Send size={14} /> {isSending ? COPY.shareSending : COPY.shareSend}
              </button>
            </>
          )}
          {stage === 'done' && (
            <button type="button" className={styles.primaryBtn} onClick={onClose}>
              {COPY.shareDone}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShareDialog;
