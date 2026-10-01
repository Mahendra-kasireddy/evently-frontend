import { useRef, useState, type FormEvent } from 'react';
import { COVER_TYPES, uploadEventCover } from './cover';
import { fromLocalInput, toLocalInput } from './constants';
import type { PublicEvent, PublicEventInput } from './types';
import s from './styles.module.css';

interface EventFormProps {
  /** The event being edited, or null when this is a new one. */
  event: PublicEvent | null;
  busy: boolean;
  error: string | null;
  onSubmit: (body: PublicEventInput) => Promise<unknown>;
  onCancel: () => void;
}

/**
 * The create-and-edit form for a public event.
 *
 * One form for both, because they ask for exactly the same things and two
 * copies is how the create screen comes to collect a field the edit screen
 * forgets. The cover is uploaded through the shared endpoint before the event
 * is saved, so an event is only ever pointed at artwork that already exists.
 */
export function EventForm({ event, busy, error, onSubmit, onCancel }: EventFormProps) {
  const [coverUrl, setCoverUrl] = useState(event?.coverUrl ?? '');
  const [coverBusy, setCoverBusy] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickCover = async (file: File | undefined) => {
    if (!file) return;
    setCoverError(null);
    setCoverBusy(true);
    try {
      const uploaded = await uploadEventCover(file);
      setCoverUrl(uploaded.url);
    } catch (e) {
      setCoverError(
        (e as { message?: string }).message ?? 'That image could not be uploaded. Try another.',
      );
    } finally {
      setCoverBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (name: string) => String(data.get(name) ?? '').trim();
    const number = (name: string) => {
      const raw = text(name);
      return raw ? Number(raw) : 0;
    };

    const start = fromLocalInput(text('startDateTime'));
    if (!start) return;

    const body: PublicEventInput = {
      title: text('title'),
      category: text('category'),
      description: text('description'),
      coverUrl,
      contactName: text('contactName'),
      contactPhone: text('contactPhone'),
      contactEmail: text('contactEmail'),
      startDateTime: start,
      endDateTime: fromLocalInput(text('endDateTime')),
      timezone: text('timezone') || 'Asia/Kolkata',
      venue: {
        name: text('venueName'),
        address: text('venueAddress'),
        city: text('venueCity'),
        state: text('venueState'),
        /* Left out rather than sent as 0: the equator off the coast of Africa
           is a real place, and an event defaulted to it gets drawn there. */
        ...(text('latitude') ? { latitude: Number(text('latitude')) } : {}),
        ...(text('longitude') ? { longitude: Number(text('longitude')) } : {}),
      },
      capacity: number('capacity'),
      maxPerCustomer: number('maxPerCustomer'),
    };

    void onSubmit(body);
  };

  return (
    <form className={s.form} onSubmit={submit}>
      <fieldset className={s.fieldset}>
        <legend className={s.legend}>The event</legend>

        <label className={s.field}>
          <span className={s.label}>Name</span>
          <input
            className={s.input}
            name="title"
            defaultValue={event?.title ?? ''}
            required
            minLength={3}
            maxLength={120}
            placeholder="Hyderabad Comedy Night"
          />
        </label>

        <div className={s.row}>
          <label className={s.field}>
            <span className={s.label}>Category</span>
            <input
              className={s.input}
              name="category"
              defaultValue={event?.category ?? ''}
              maxLength={60}
              placeholder="Music, comedy, workshop…"
            />
          </label>
          <label className={s.field}>
            <span className={s.label}>Timezone</span>
            <input
              className={s.input}
              name="timezone"
              defaultValue={event?.timezone ?? 'Asia/Kolkata'}
              maxLength={64}
            />
            <span className={s.hint}>An IANA name, like Asia/Kolkata.</span>
          </label>
        </div>

        <label className={s.field}>
          <span className={s.label}>Description</span>
          <textarea
            className={s.textarea}
            name="description"
            defaultValue={event?.description ?? ''}
            maxLength={4000}
            rows={4}
            placeholder="What happens, who it is for, what to bring."
          />
        </label>

        <div className={s.field}>
          <span className={s.label}>Cover image</span>
          {coverUrl ? (
            <img className={s.coverPreview} src={coverUrl} alt="" />
          ) : (
            <p className={s.hint}>No cover yet. This is the first thing a customer sees.</p>
          )}
          <input
            ref={fileRef}
            className={s.file}
            type="file"
            accept={COVER_TYPES}
            onChange={(e) => void pickCover(e.target.files?.[0])}
            disabled={coverBusy}
          />
          {coverBusy ? <span className={s.hint}>Uploading…</span> : null}
          {coverError ? <p className={s.error}>{coverError}</p> : null}
        </div>
      </fieldset>

      <fieldset className={s.fieldset}>
        <legend className={s.legend}>When</legend>
        <div className={s.row}>
          <label className={s.field}>
            <span className={s.label}>Starts</span>
            <input
              className={s.input}
              type="datetime-local"
              name="startDateTime"
              defaultValue={toLocalInput(event?.startDateTime)}
              required
            />
          </label>
          <label className={s.field}>
            <span className={s.label}>Ends</span>
            <input
              className={s.input}
              type="datetime-local"
              name="endDateTime"
              defaultValue={toLocalInput(event?.endDateTime)}
            />
          </label>
        </div>
        <p className={s.hint}>
          These are entered on your computer&rsquo;s clock and stored as exact instants. The
          timezone above is how they are read back to customers.
        </p>
      </fieldset>

      <fieldset className={s.fieldset}>
        <legend className={s.legend}>Where</legend>
        <label className={s.field}>
          <span className={s.label}>Venue</span>
          <input
            className={s.input}
            name="venueName"
            defaultValue={event?.venue?.name ?? ''}
            maxLength={160}
          />
        </label>
        <label className={s.field}>
          <span className={s.label}>Address</span>
          <textarea
            className={s.textarea}
            name="venueAddress"
            defaultValue={event?.venue?.address ?? ''}
            maxLength={400}
            rows={2}
          />
        </label>
        <div className={s.row}>
          <label className={s.field}>
            <span className={s.label}>City</span>
            <input className={s.input} name="venueCity" defaultValue={event?.venue?.city ?? ''} />
          </label>
          <label className={s.field}>
            <span className={s.label}>State</span>
            <input className={s.input} name="venueState" defaultValue={event?.venue?.state ?? ''} />
          </label>
        </div>
        <div className={s.row}>
          <label className={s.field}>
            <span className={s.label}>Latitude</span>
            <input
              className={s.input}
              name="latitude"
              inputMode="decimal"
              defaultValue={event?.venue?.latitude ?? ''}
            />
          </label>
          <label className={s.field}>
            <span className={s.label}>Longitude</span>
            <input
              className={s.input}
              name="longitude"
              inputMode="decimal"
              defaultValue={event?.venue?.longitude ?? ''}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className={s.fieldset}>
        <legend className={s.legend}>How many, and who to ask</legend>
        <div className={s.row}>
          <label className={s.field}>
            <span className={s.label}>Capacity</span>
            <input
              className={s.input}
              type="number"
              min={0}
              name="capacity"
              defaultValue={event?.capacity ?? 0}
            />
            <span className={s.hint}>0 means your ticket types are the only limit.</span>
          </label>
          <label className={s.field}>
            <span className={s.label}>Max per customer</span>
            <input
              className={s.input}
              type="number"
              min={0}
              name="maxPerCustomer"
              defaultValue={event?.maxPerCustomer ?? 0}
            />
            <span className={s.hint}>0 means no ceiling.</span>
          </label>
        </div>
        <div className={s.row}>
          <label className={s.field}>
            <span className={s.label}>Contact name</span>
            <input
              className={s.input}
              name="contactName"
              defaultValue={event?.contactName ?? ''}
            />
          </label>
          <label className={s.field}>
            <span className={s.label}>Phone</span>
            <input
              className={s.input}
              name="contactPhone"
              defaultValue={event?.contactPhone ?? ''}
            />
          </label>
          <label className={s.field}>
            <span className={s.label}>Email</span>
            <input
              className={s.input}
              type="email"
              name="contactEmail"
              defaultValue={event?.contactEmail ?? ''}
            />
          </label>
        </div>
      </fieldset>

      {error ? <p className={s.error}>{error}</p> : null}

      <div className={s.formActions}>
        <button type="button" className={s.ghostBtn} onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className={s.primaryBtn} disabled={busy || coverBusy}>
          {busy ? 'Saving…' : event ? 'Save changes' : 'Create event'}
        </button>
      </div>
    </form>
  );
}

export default EventForm;
