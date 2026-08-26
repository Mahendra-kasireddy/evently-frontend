import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { cardDateLabel, emptySubEvent } from '@features/invitation';
import type { CardColour, InvitationSubEvent, SubEventVisibility } from '@features/invitation';
import { INVITATION_COPY as COPY } from '../constants';
import { DEFAULT_TIMEZONE, TIMEZONES } from '../timezones';
import styles from '../styles.module.css';

export interface SubEventEditorProps {
  cards: InvitationSubEvent[];
  palette: CardColour[];
  /** The invitation's zone, inherited by a card that does not set its own. */
  fallbackTimezone: string;
  /** Index of the card whose fields are expanded, or null. */
  openIndex: number | null;
  onOpenChange: (index: number | null) => void;
  onChange: (cards: InvitationSubEvent[]) => void;
}

/**
 * Add, edit, reorder and remove the Save-the-Date cards.
 *
 * Edited as a local draft of the whole list and written in one PATCH when the
 * organizer saves the section — the API replaces the array wholesale, and a
 * per-field write would mean an organizer half-way through typing a venue has
 * already published it to a customer who may be reviewing at that moment.
 *
 * Rows are expandable rather than a nested dialog: a dialog inside a dialog
 * takes the focus trap with it, and the organizer needs to see the running
 * order while editing one entry.
 */
export function SubEventEditor({
  cards,
  palette,
  fallbackTimezone,
  openIndex,
  onOpenChange,
  onChange,
}: SubEventEditorProps) {
  /** Writes one field of one card, leaving the rest of the draft alone. */
  const setField = <K extends keyof InvitationSubEvent>(
    index: number,
    key: K,
    value: InvitationSubEvent[K],
  ) => {
    onChange(cards.map((card, i) => (i === index ? { ...card, [key]: value } : card)));
  };

  const add = () => {
    onChange([...cards, emptySubEvent(fallbackTimezone || DEFAULT_TIMEZONE)]);
    // The new row opens straight away — an organizer who just clicked "add"
    // wants the fields, not another click.
    onOpenChange(cards.length);
  };

  const remove = (index: number) => {
    onChange(cards.filter((_, i) => i !== index));
    onOpenChange(null);
  };

  /** Array order is the guest-facing order, so moving is a splice. */
  const move = (index: number, delta: number) => {
    const to = index + delta;
    if (to < 0 || to >= cards.length) return;
    const next = [...cards];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    onChange(next);
    onOpenChange(to);
  };

  return (
    <div className={styles.subEvents}>
      <h3 className={styles.fieldGroup}>{COPY.subEventsTitle}</h3>
      <p className={styles.hint}>{COPY.subEventsHint}</p>

      {cards.length === 0 && <p className={styles.subEmpty}>{COPY.subEventsEmpty}</p>}

      <ul className={styles.subList}>
        {cards.map((card, index) => {
          const expanded = openIndex === index;
          const swatch = palette.find((c) => c.id === card.colour);
          return (
            <li key={card.id || `new-${index}`} className={styles.subRow}>
              <div className={styles.subHead}>
                <span
                  className={styles.subSwatch}
                  style={{ background: swatch?.wash ?? '#fff', borderColor: swatch?.ink ?? '#c9ccd6' }}
                  aria-hidden
                />
                <button
                  type="button"
                  className={styles.subTitleBtn}
                  onClick={() => onOpenChange(expanded ? null : index)}
                  aria-expanded={expanded}
                >
                  <span className={styles.subName}>{card.name || COPY.subEventUnnamed}</span>
                  <span className={styles.subMeta}>
                    {cardDateLabel(card.eventDate) || COPY.subEventNoDate}
                    {card.visibility === 'hidden' ? ` · ${COPY.subHidden}` : ''}
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.subIconBtn}
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`${COPY.subMoveUp}: ${card.name || COPY.subEventUnnamed}`}
                >
                  <ChevronUp size={15} />
                </button>
                <button
                  type="button"
                  className={styles.subIconBtn}
                  onClick={() => move(index, 1)}
                  disabled={index === cards.length - 1}
                  aria-label={`${COPY.subMoveDown}: ${card.name || COPY.subEventUnnamed}`}
                >
                  <ChevronDown size={15} />
                </button>
                <button
                  type="button"
                  className={styles.subIconBtn}
                  onClick={() => remove(index)}
                  aria-label={`${COPY.subRemove}: ${card.name || COPY.subEventUnnamed}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {expanded && (
                <div className={styles.subBody}>
                  <label className={styles.field}>
                    <span>{COPY.subName}</span>
                    <input
                      value={card.name}
                      onChange={(e) => setField(index, 'name', e.target.value)}
                      maxLength={80}
                      placeholder="Mehendi"
                    />
                  </label>

                  <div className={styles.fieldRow}>
                    <label className={styles.field}>
                      <span>{COPY.subDate}</span>
                      <input
                        type="date"
                        value={card.eventDate}
                        onChange={(e) => setField(index, 'eventDate', e.target.value)}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>{COPY.subStart}</span>
                      <input
                        type="time"
                        value={card.eventTime}
                        onChange={(e) => setField(index, 'eventTime', e.target.value)}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>{COPY.subEnd}</span>
                      <input
                        type="time"
                        value={card.endTime}
                        onChange={(e) => setField(index, 'endTime', e.target.value)}
                      />
                    </label>
                  </div>
                  <p className={styles.hint}>{COPY.subEndHint}</p>

                  <label className={styles.field}>
                    <span>{COPY.subTimezone}</span>
                    <select
                      value={card.timezone || fallbackTimezone || DEFAULT_TIMEZONE}
                      onChange={(e) => setField(index, 'timezone', e.target.value)}
                    >
                      {TIMEZONES.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.field}>
                    <span>{COPY.subVenueName}</span>
                    <input
                      value={card.venueName}
                      onChange={(e) => setField(index, 'venueName', e.target.value)}
                      maxLength={120}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>{COPY.subVenueAddress}</span>
                    <input
                      value={card.venueAddress}
                      onChange={(e) => setField(index, 'venueAddress', e.target.value)}
                      maxLength={240}
                    />
                    <small className={styles.hint}>{COPY.subAddressHint}</small>
                  </label>

                  <label className={styles.field}>
                    <span>{COPY.subDressCode}</span>
                    <input
                      value={card.dressCode}
                      onChange={(e) => setField(index, 'dressCode', e.target.value)}
                      maxLength={80}
                      placeholder="Festive Indian"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>{COPY.subNote}</span>
                    <textarea
                      value={card.note}
                      onChange={(e) => setField(index, 'note', e.target.value)}
                      rows={2}
                      maxLength={300}
                    />
                  </label>

                  <span className={styles.fieldLabel}>{COPY.subColour}</span>
                  <div className={styles.swatches} role="group" aria-label={COPY.subColour}>
                    <button
                      type="button"
                      className={`${styles.swatch} ${card.colour === '' ? styles.swatchOn : ''}`}
                      style={{ background: '#fff', borderColor: '#c9ccd6' }}
                      onClick={() => setField(index, 'colour', '')}
                      aria-pressed={card.colour === ''}
                      title={COPY.subColourNone}
                    >
                      <span className={styles.swatchLabel}>{COPY.subColourNone}</span>
                    </button>
                    {palette.map((colour) => (
                      <button
                        key={colour.id}
                        type="button"
                        className={`${styles.swatch} ${card.colour === colour.id ? styles.swatchOn : ''}`}
                        style={{ background: colour.wash, borderColor: colour.ink }}
                        onClick={() => setField(index, 'colour', colour.id)}
                        aria-pressed={card.colour === colour.id}
                        title={colour.label}
                      >
                        <span className={styles.swatchLabel} style={{ color: colour.ink }}>
                          {colour.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <label className={styles.field}>
                    <span>{COPY.subVisibility}</span>
                    <select
                      value={card.visibility}
                      onChange={(e) =>
                        setField(index, 'visibility', e.target.value as SubEventVisibility)
                      }
                    >
                      <option value="all">{COPY.subVisibleAll}</option>
                      <option value="hidden">{COPY.subVisibleHidden}</option>
                    </select>
                    {/*
                      "Only specific invitees" is missing on purpose: there is no
                      invitee record in the platform to target, so the option
                      would be a setting nothing could honour.
                    */}
                    <small className={styles.hint}>{COPY.subVisibilityHint}</small>
                  </label>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <button type="button" className={styles.subAddBtn} onClick={add}>
        <Plus size={15} />
        {COPY.subEventAdd}
      </button>
    </div>
  );
}

export default SubEventEditor;
