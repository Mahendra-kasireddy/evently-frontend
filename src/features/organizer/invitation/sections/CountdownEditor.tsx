import { Btn } from '@shared/partner';
import { INVITATION_COPY as COPY } from '../constants';
import { NOTIFICATION_MESSAGE_MAX } from '../artwork';
import type { InvitationSubEvent } from '../types';
import styles from '../styles.module.css';

export interface CountdownSettings {
  countdownSubEventId: string;
  postEventMessage: string;
  oneDayNotificationEnabled: boolean;
  oneDayNotificationMessage: string;
  missedNotificationMessage: string;
}

export interface CountdownEditorProps {
  /** The organizer's own Save-the-Date cards — the only valid targets. */
  subEvents: InvitationSubEvent[];
  settings: CountdownSettings;
  isSaving: boolean;
  dirty: boolean;
  error: string;
  onChange: (patch: Partial<CountdownSettings>) => void;
  onSave: () => void;
}

/**
 * Which event the countdown points at, and what guests are told about it.
 *
 * The list of targets is the organizer's own sub-events — nothing here is
 * typed, so a countdown can only ever point at an event that exists on this
 * invitation, which is also what the server checks on the way in.
 *
 * Two messages, kept apart on purpose: one replaces the timer once the moment
 * passes, the other is the note in the night-before card. They are read in
 * different places at different times and are not interchangeable.
 */
export function CountdownEditor({
  subEvents,
  settings,
  isSaving,
  dirty,
  error,
  onChange,
  onSave,
}: CountdownEditorProps) {
  const notice = settings.oneDayNotificationEnabled;

  return (
    <section className={styles.story}>
      <h3 className={styles.artworkTitle}>{COPY.countdownTitle}</h3>
      <p className={styles.artworkLead}>{COPY.countdownLead}</p>

      <fieldset className={styles.targets}>
        <legend className={styles.storyLabel}>{COPY.countdownTarget}</legend>

        {/* Always offered, and the only option when there are no cards yet. */}
        <label className={styles.target}>
          <input
            type="radio"
            name="countdown-target"
            checked={settings.countdownSubEventId === ''}
            onChange={() => onChange({ countdownSubEventId: '' })}
            disabled={isSaving}
          />
          <span>{COPY.countdownWholeEvent}</span>
        </label>

        {subEvents.map((event) => (
          <label key={event.id} className={styles.target}>
            <input
              type="radio"
              name="countdown-target"
              checked={settings.countdownSubEventId === event.id}
              onChange={() => onChange({ countdownSubEventId: event.id })}
              disabled={isSaving}
            />
            <span>{event.name || COPY.countdownUnnamed}</span>
          </label>
        ))}

        {subEvents.length === 0 && (
          <p className={styles.artworkNote}>{COPY.countdownNoSubEvents}</p>
        )}
      </fieldset>

      <label className={styles.storyLabel} htmlFor="post-event">
        {COPY.countdownAfter}
      </label>
      <textarea
        id="post-event"
        className={styles.storyCaption}
        value={settings.postEventMessage}
        onChange={(e) => onChange({ postEventMessage: e.target.value })}
        placeholder={COPY.countdownAfterHint}
        maxLength={NOTIFICATION_MESSAGE_MAX}
        rows={2}
        disabled={isSaving}
      />

      <div className={styles.noticeHead}>
        <label className={styles.storyLabel} htmlFor="notice-on">
          {COPY.noticeTitle}
        </label>
        <label className={styles.toggle}>
          <input
            id="notice-on"
            type="checkbox"
            checked={notice}
            onChange={(e) =>
              onChange({ oneDayNotificationEnabled: e.target.checked })
            }
            disabled={isSaving}
          />
          {/* Said in words, not only by the position of a switch. */}
          <span>{notice ? COPY.noticeOn : COPY.noticeOff}</span>
        </label>
      </div>
      <p className={styles.artworkNote}>{COPY.noticeLead}</p>

      {notice && (
        <>
          <label className={styles.storyLabel} htmlFor="notice-body">
            {COPY.noticeBody}
          </label>
          <textarea
            id="notice-body"
            className={styles.storyCaption}
            value={settings.oneDayNotificationMessage}
            onChange={(e) =>
              onChange({ oneDayNotificationMessage: e.target.value })
            }
            placeholder={COPY.noticeBodyHint}
            maxLength={NOTIFICATION_MESSAGE_MAX}
            rows={2}
            disabled={isSaving}
          />

          <label className={styles.storyLabel} htmlFor="notice-missed">
            {COPY.noticeMissed}
          </label>
          <textarea
            id="notice-missed"
            className={styles.storyCaption}
            value={settings.missedNotificationMessage}
            onChange={(e) =>
              onChange({ missedNotificationMessage: e.target.value })
            }
            placeholder={COPY.noticeMissedHint}
            maxLength={NOTIFICATION_MESSAGE_MAX}
            rows={2}
            disabled={isSaving}
          />
          <p className={styles.artworkNote}>{COPY.noticeMissedWhy}</p>
        </>
      )}

      <div className={styles.storyBar}>
        <Btn kind="primary" sm onClick={onSave} disabled={isSaving || !dirty}>
          {isSaving ? COPY.storySaving : COPY.countdownSave}
        </Btn>
      </div>

      {error && <p className={styles.artworkError}>{error}</p>}
    </section>
  );
}

export default CountdownEditor;
