import { UPLOADER_OPTIONS } from '../constants';
import type { EventMemoriesSettings } from '../types';
import s from '../styles.module.css';

interface MemoriesPanelProps {
  settings: EventMemoriesSettings;
  busy: boolean;
  onChange: (body: Partial<EventMemoriesSettings>) => Promise<unknown>;
}

/**
 * Shared memories for a public event.
 *
 * The switches only. The gallery itself, the uploads, the thumbnails and the
 * moderation queue are the Shared Memories engine Evently already runs — this
 * says who may use it and for how long, and nothing about storage or image
 * processing is rebuilt for public events.
 */
export function MemoriesPanel({ settings, busy, onChange }: MemoriesPanelProps) {
  const set = (body: Partial<EventMemoriesSettings>) => void onChange(body);

  return (
    <div className={s.panel}>
      <label className={s.switchRow}>
        <input
          type="checkbox"
          checked={settings.enabled}
          disabled={busy}
          onChange={(e) => set({ enabled: e.target.checked })}
        />
        <span>
          <strong>Shared memories</strong>
          <span className={s.hint}>
            A gallery your attendees fill with photos, videos and reels from the night.
          </span>
        </span>
      </label>

      {settings.enabled ? (
        <>
          <fieldset className={s.fieldset}>
            <legend className={s.legend}>Who may add to it</legend>
            {UPLOADER_OPTIONS.map((option) => (
              <label key={option.value} className={s.radioRow}>
                <input
                  type="radio"
                  name="uploaders"
                  value={option.value}
                  checked={settings.uploaders === option.value}
                  disabled={busy}
                  onChange={() => set({ uploaders: option.value })}
                />
                <span>
                  <strong>{option.label}</strong>
                  <span className={s.hint}>{option.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <label className={s.switchRow}>
            <input
              type="checkbox"
              checked={settings.attendeeView}
              disabled={busy}
              onChange={(e) => set({ attendeeView: e.target.checked })}
            />
            <span>
              <strong>Attendees can see the gallery</strong>
              <span className={s.hint}>Turn this off and only you can look.</span>
            </span>
          </label>

          <label className={s.switchRow}>
            <input
              type="checkbox"
              checked={settings.attendeeDownload}
              disabled={busy}
              onChange={(e) => set({ attendeeDownload: e.target.checked })}
            />
            <span>
              <strong>Attendees can download</strong>
              <span className={s.hint}>
                Looking and keeping are separate permissions — this one is off by default.
              </span>
            </span>
          </label>

          <label className={s.switchRow}>
            <input
              type="checkbox"
              checked={settings.moderation}
              disabled={busy}
              onChange={(e) => set({ moderation: e.target.checked })}
            />
            <span>
              <strong>Approve everything first</strong>
              <span className={s.hint}>Nothing reaches the gallery until you pass it.</span>
            </span>
          </label>

          <label className={s.field}>
            <span className={s.label}>Uploads stay open for</span>
            <input
              className={s.inputNarrow}
              type="number"
              min={0}
              max={365}
              value={settings.uploadWindowDays}
              disabled={busy}
              onChange={(e) => set({ uploadWindowDays: Number(e.target.value) })}
            />
            <span className={s.hint}>
              Days after the event ends. People post the morning after, not during.
            </span>
          </label>
        </>
      ) : null}
    </div>
  );
}

export default MemoriesPanel;
