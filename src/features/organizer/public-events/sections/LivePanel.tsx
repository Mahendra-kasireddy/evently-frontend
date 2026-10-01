import { LIVE_HELP, LIVE_STATE_LABEL, fromLocalInput, toLocalInput } from '../constants';
import type { EventLiveSettings, LiveState } from '../types';
import s from '../styles.module.css';

interface LivePanelProps {
  settings: EventLiveSettings;
  state: LiveState;
  busy: boolean;
  error: string | null;
  onChange: (body: Partial<EventLiveSettings>) => Promise<unknown>;
}

/**
 * The event's live stream.
 *
 * Evently decides who may watch; the URL is whatever embeddable player the
 * organizer uses. The two are separate on purpose — entitlement is ours and a
 * provider is theirs to change — and the state below is read from the clock
 * rather than from a switch somebody has to remember to flip at 7pm.
 */
export function LivePanel({ settings, state, busy, error, onChange }: LivePanelProps) {
  const set = (body: Partial<EventLiveSettings>) => void onChange(body);

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
          <strong>Live stream</strong>
          <span className={s.hint}>
            {settings.enabled
              ? `Currently ${LIVE_STATE_LABEL[state].toLowerCase()}.`
              : 'Off — nobody sees a stream yet.'}
          </span>
        </span>
      </label>

      {settings.enabled ? (
        <>
          <label className={s.field}>
            <span className={s.label}>Stream link</span>
            <input
              className={s.input}
              defaultValue={settings.url}
              disabled={busy}
              placeholder="https://…"
              onBlur={(e) => {
                if (e.target.value !== settings.url) set({ url: e.target.value.trim() });
              }}
            />
            <span className={s.hint}>{LIVE_HELP}</span>
          </label>

          <fieldset className={s.fieldset}>
            <legend className={s.legend}>Who may watch</legend>
            <label className={s.radioRow}>
              <input
                type="radio"
                name="access"
                checked={settings.access === 'ticketed'}
                disabled={busy}
                onChange={() => set({ access: 'ticketed' })}
              />
              <span>
                <strong>Ticket holders</strong>
                <span className={s.hint}>Only people who bought a ticket to this event.</span>
              </span>
            </label>
            <label className={s.radioRow}>
              <input
                type="radio"
                name="access"
                checked={settings.access === 'free'}
                disabled={busy}
                onChange={() => set({ access: 'free' })}
              />
              <span>
                <strong>Anyone</strong>
                <span className={s.hint}>Open to anybody who can see the event.</span>
              </span>
            </label>
          </fieldset>

          <div className={s.row}>
            <label className={s.field}>
              <span className={s.label}>Broadcast starts</span>
              <input
                className={s.input}
                type="datetime-local"
                defaultValue={toLocalInput(settings.startsAt)}
                disabled={busy}
                onBlur={(e) => set({ startsAt: fromLocalInput(e.target.value) ?? null })}
              />
            </label>
            <label className={s.field}>
              <span className={s.label}>Broadcast ends</span>
              <input
                className={s.input}
                type="datetime-local"
                defaultValue={toLocalInput(settings.endsAt)}
                disabled={busy}
                onBlur={(e) => set({ endsAt: fromLocalInput(e.target.value) ?? null })}
              />
            </label>
          </div>
          <p className={s.hint}>
            These are the broadcast&rsquo;s own times, not the event&rsquo;s — a stream often
            starts after the doors do.
          </p>

          <label className={s.switchRow}>
            <input
              type="checkbox"
              checked={settings.replayEnabled}
              disabled={busy}
              onChange={(e) => set({ replayEnabled: e.target.checked })}
            />
            <span>
              <strong>Leave a replay up afterwards</strong>
              <span className={s.hint}>The same people who could watch live can watch back.</span>
            </span>
          </label>

          {error ? <p className={s.error}>{error}</p> : null}
        </>
      ) : null}
    </div>
  );
}

export default LivePanel;
