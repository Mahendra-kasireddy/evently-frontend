import { useRef, useState, type FormEvent } from 'react';
import type { CheckInOutcome } from '../types';
import s from '../styles.module.css';

interface CheckInPanelProps {
  open: boolean;
  busy: boolean;
  last: CheckInOutcome | null;
  onScan: (payload: { qrToken?: string; code?: string }) => Promise<CheckInOutcome>;
  onClear: () => void;
}

const HEADLINE: Record<CheckInOutcome['result'], string> = {
  entry_allowed: 'Entry allowed',
  already_checked_in: 'Already checked in',
  invalid_ticket: 'Invalid ticket',
};

/**
 * The door.
 *
 * A box that takes whatever a handheld scanner types, and a short code for
 * when a camera will not focus. The outcome shown is the server's answer and
 * only the server's: this panel decides nothing, because a client that decides
 * for itself is a client that can be told to decide yes.
 */
export function CheckInPanel({ open, busy, last, onScan, onClear }: CheckInPanelProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) {
    return (
      <div className={s.panel}>
        <p className={s.hint}>
          The door opens once the event is published. A draft event has nobody to let in, and a
          cancelled one is shut however valid the ticket in somebody&rsquo;s hand is.
        </p>
      </div>
    );
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const raw = value.trim();
    if (!raw) return;
    /*
     * A scanned QR carries the long token; a code read aloud is short. Sending
     * the right field matters because the server looks each up by its own
     * column — and either way it is scoped to this event, so a valid ticket for
     * the organizer's other event is still refused here.
     */
    await onScan(raw.length > 24 ? { qrToken: raw } : { code: raw.toUpperCase() });
    setValue('');
    inputRef.current?.focus();
  };

  const tone =
    last?.result === 'entry_allowed'
      ? s.scanOk
      : last?.result === 'already_checked_in'
        ? s.scanWarn
        : s.scanBad;

  return (
    <div className={s.panel}>
      <form className={s.scanForm} onSubmit={submit}>
        <label className={s.field}>
          <span className={s.label}>Scan a ticket, or type its code</span>
          <input
            ref={inputRef}
            className={s.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Point the scanner here"
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          <span className={s.hint}>
            A handheld scanner types the ticket and presses enter. Nothing here is checked in this
            browser — the server decides every entry.
          </span>
        </label>
        <button type="submit" className={s.primaryBtn} disabled={busy || !value.trim()}>
          {busy ? 'Checking…' : 'Check in'}
        </button>
      </form>

      {last ? (
        <div className={`${s.scanResult} ${tone}`} role="status" aria-live="polite">
          <strong className={s.scanHeadline}>{HEADLINE[last.result]}</strong>
          {last.ticket ? (
            <p className={s.scanWho}>
              {last.ticket.customerName || 'Guest'} · {last.ticket.ticketTypeName} ·{' '}
              <code className={s.code}>{last.ticket.code}</code>
            </p>
          ) : null}
          {last.reason ? <p className={s.scanWhy}>{last.reason}</p> : null}
          <button type="button" className={s.linkBtn} onClick={onClear}>
            Clear
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default CheckInPanel;
