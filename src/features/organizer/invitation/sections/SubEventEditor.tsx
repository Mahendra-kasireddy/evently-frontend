import { ChevronDown, ChevronUp, Plus, Radio, Trash2 } from 'lucide-react';
import {
  cardDateLabel,
  embedUrlOf,
  emptySubEvent,
  GUEST_GROUPS,
} from '@features/invitation';
import type {
  CardColour,
  InvitationSubEvent,
  SubEventVisibility,
} from '@features/invitation';
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
    onChange(
      cards.map((card, i) => (i === index ? { ...card, [key]: value } : card)),
    );
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
      <h3 className={styles.artworkTitle}>{COPY.subEventsTitle}</h3>
      <p className={styles.artworkLead}>
        {COPY.subEventsHint} {COPY.liveRowHint}
      </p>

      {cards.length === 0 && (
        <p className={styles.subEmpty}>{COPY.subEventsEmpty}</p>
      )}

      <ul className={styles.subList}>
        {cards.map((card, index) => {
          const expanded = openIndex === index;
          const swatch = palette.find((c) => c.id === card.colour);
          return (
            <li key={card.id || `new-${index}`} className={styles.subRow}>
              <div className={styles.subHead}>
                <span
                  className={styles.subSwatch}
                  style={{
                    background: swatch?.wash ?? '#fff',
                    borderColor: swatch?.ink ?? '#c9ccd6',
                  }}
                  aria-hidden
                />
                <button
                  type="button"
                  className={styles.subTitleBtn}
                  onClick={() => onOpenChange(expanded ? null : index)}
                  aria-expanded={expanded}
                >
                  <span className={styles.subName}>
                    {card.name || COPY.subEventUnnamed}
                  </span>
                  <span className={styles.subMeta}>
                    {cardDateLabel(card.eventDate) || COPY.subEventNoDate}
                    {card.visibility === 'hidden' ? ` · ${COPY.subHidden}` : ''}
                    {card.liveEnabled ? ` · ${COPY.liveOn}` : ''}
                  </span>
                </button>
                {/*
                  Going live from the row, without opening anything.
                  Buried inside the panel below, this control was two scrolls
                  and a click away from an organizer who needs it the moment a
                  ceremony begins. With no url there is nothing to put on air,
                  so it opens the panel instead of refusing silently.
                */}
                <button
                  type="button"
                  className={`${styles.subLiveBtn} ${card.liveEnabled ? styles.subLiveOn : ''}`}
                  onClick={() => {
                    if (!(card.liveUrl ?? '').trim()) {
                      onOpenChange(index);
                      return;
                    }
                    setField(index, 'liveEnabled', !card.liveEnabled);
                  }}
                  aria-pressed={Boolean(card.liveEnabled)}
                  aria-label={
                    !(card.liveUrl ?? '').trim()
                      ? COPY.liveSetUp(card.name || COPY.subEventUnnamed)
                      : card.liveEnabled
                        ? COPY.liveEndLive(card.name || COPY.subEventUnnamed)
                        : COPY.liveGoLive(card.name || COPY.subEventUnnamed)
                  }
                >
                  <Radio size={14} />
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
                        onChange={(e) =>
                          setField(index, 'eventDate', e.target.value)
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      <span>{COPY.subStart}</span>
                      <input
                        type="time"
                        value={card.eventTime}
                        onChange={(e) =>
                          setField(index, 'eventTime', e.target.value)
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      <span>{COPY.subEnd}</span>
                      <input
                        type="time"
                        value={card.endTime}
                        onChange={(e) =>
                          setField(index, 'endTime', e.target.value)
                        }
                      />
                    </label>
                  </div>
                  <p className={styles.hint}>{COPY.subEndHint}</p>

                  <label className={styles.field}>
                    <span>{COPY.subTimezone}</span>
                    <select
                      value={
                        card.timezone || fallbackTimezone || DEFAULT_TIMEZONE
                      }
                      onChange={(e) =>
                        setField(index, 'timezone', e.target.value)
                      }
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
                      onChange={(e) =>
                        setField(index, 'venueName', e.target.value)
                      }
                      maxLength={120}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>{COPY.subVenueAddress}</span>
                    <input
                      value={card.venueAddress}
                      onChange={(e) =>
                        setField(index, 'venueAddress', e.target.value)
                      }
                      maxLength={240}
                    />
                    <small className={styles.hint}>{COPY.subAddressHint}</small>
                  </label>

                  <label className={styles.field}>
                    <span>{COPY.subDressCode}</span>
                    <input
                      value={card.dressCode}
                      onChange={(e) =>
                        setField(index, 'dressCode', e.target.value)
                      }
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
                  <div
                    className={styles.swatches}
                    role="group"
                    aria-label={COPY.subColour}
                  >
                    <button
                      type="button"
                      className={`${styles.swatch} ${card.colour === '' ? styles.swatchOn : ''}`}
                      style={{ background: '#fff', borderColor: '#c9ccd6' }}
                      onClick={() => setField(index, 'colour', '')}
                      aria-pressed={card.colour === ''}
                      title={COPY.subColourNone}
                    >
                      <span className={styles.swatchLabel}>
                        {COPY.subColourNone}
                      </span>
                    </button>
                    {palette.map((colour) => (
                      <button
                        key={colour.id}
                        type="button"
                        className={`${styles.swatch} ${card.colour === colour.id ? styles.swatchOn : ''}`}
                        style={{
                          background: colour.wash,
                          borderColor: colour.ink,
                        }}
                        onClick={() => setField(index, 'colour', colour.id)}
                        aria-pressed={card.colour === colour.id}
                        title={colour.label}
                      >
                        <span
                          className={styles.swatchLabel}
                          style={{ color: colour.ink }}
                        >
                          {colour.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/*
                    The stream lives with the event it streams, and directly
                    above the visibility control on purpose: who may watch is
                    that same setting, so the two are read together rather
                    than being a second rule that can disagree with the first.
                  */}
                  <fieldset className={styles.live}>
                    <legend className={styles.liveLegend}>
                      <Radio size={14} aria-hidden="true" />
                      {COPY.liveTitle}
                    </legend>
                    {/*
                      The switch gets a row of its own rather than a corner of
                      the legend. A legend is shrink-to-fit, so it could never
                      hold a control at the far end — the checkbox ended up
                      wedged against the title, looking like a tick box for the
                      heading rather than the control that puts a ceremony on
                      air in front of every guest.
                    */}
                    <label className={styles.liveSwitch}>
                      <input
                        type="checkbox"
                        className={styles.liveSwitchInput}
                        checked={Boolean(card.liveEnabled)}
                        onChange={(e) =>
                          setField(index, 'liveEnabled', e.target.checked)
                        }
                        disabled={!(card.liveUrl ?? '').trim()}
                      />
                      <span className={styles.liveTrack} aria-hidden="true">
                        <span className={styles.liveKnob} />
                      </span>
                      {/* Said in words, not only by the position of a knob. */}
                      <span className={styles.liveSwitchText}>
                        {card.liveEnabled ? COPY.liveOn : COPY.liveOff}
                      </span>
                    </label>
                    <p className={styles.hint}>{COPY.liveHint}</p>

                    <label className={styles.field}>
                      <span>{COPY.liveStreamTitle}</span>
                      <input
                        value={card.liveTitle ?? ''}
                        onChange={(e) =>
                          setField(index, 'liveTitle', e.target.value)
                        }
                        maxLength={80}
                        placeholder={COPY.liveStreamTitleHint}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>{COPY.liveUrl}</span>
                      <input
                        type="url"
                        value={card.liveUrl ?? ''}
                        onChange={(e) =>
                          setField(index, 'liveUrl', e.target.value.trim())
                        }
                        onBlur={(e) =>
                          setField(index, 'liveUrl', embedUrlOf(e.target.value))
                        }
                        maxLength={500}
                        placeholder={COPY.liveUrlPlaceholder}
                      />
                      <small className={styles.hint}>{COPY.liveUrlHint}</small>
                    </label>
                    {/* Said where the switch is, because a switch that will
                        not move needs to say why. */}
                    {!(card.liveUrl ?? '').trim() ? (
                      <p className={styles.liveWarn}>{COPY.liveNeedsUrl}</p>
                    ) : !card.liveEnabled ? (
                      /* The state this panel is easiest to leave in by
                         accident: a url filled in and the switch still off. */
                      <p className={styles.liveWarn}>{COPY.liveOffAir}</p>
                    ) : !card.liveStartedAt ? (
                      <p className={styles.liveWarn}>{COPY.liveUnsaved}</p>
                    ) : null}

                    <div className={styles.fieldRow}>
                      <label className={styles.field}>
                        <span>{COPY.live360Url}</span>
                        <input
                          type="url"
                          value={card.live360Url ?? ''}
                          onChange={(e) =>
                            setField(index, 'live360Url', e.target.value.trim())
                          }
                          onBlur={(e) =>
                            setField(index, 'live360Url', embedUrlOf(e.target.value))
                          }
                          maxLength={500}
                        />
                      </label>
                      <label className={styles.field}>
                        <span>{COPY.liveVrUrl}</span>
                        <input
                          type="url"
                          value={card.liveVrUrl ?? ''}
                          onChange={(e) =>
                            setField(index, 'liveVrUrl', e.target.value.trim())
                          }
                          onBlur={(e) =>
                            setField(index, 'liveVrUrl', embedUrlOf(e.target.value))
                          }
                          maxLength={500}
                        />
                      </label>
                    </div>
                    <p className={styles.hint}>{COPY.liveAltHint}</p>

                    {card.liveEnabled && card.liveStartedAt && (
                      <p className={styles.liveSince}>
                        {COPY.liveStartedAt(
                          new Date(card.liveStartedAt).toLocaleString('en-GB', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }),
                        )}
                      </p>
                    )}
                  </fieldset>

                  <label className={styles.field}>
                    <span>{COPY.subVisibility}</span>
                    <select
                      value={card.visibility}
                      onChange={(e) =>
                        setField(
                          index,
                          'visibility',
                          e.target.value as SubEventVisibility,
                        )
                      }
                    >
                      <option value="all">{COPY.subVisibleAll}</option>
                      <option value="groups">{COPY.subVisibleGroups}</option>
                      <option value="hidden">{COPY.subVisibleHidden}</option>
                    </select>
                    <small className={styles.hint}>
                      {COPY.subVisibilityHint}
                    </small>
                  </label>

                  {/*
                    Targeting reuses the groups the guest list already keeps,
                    so aiming a card at the family is a matter of ticking the
                    filing the organizer has been doing all along.
                  */}
                  {card.visibility === 'groups' && (
                    <fieldset className={styles.groups}>
                      <legend className={styles.groupsLegend}>
                        {COPY.subGroups}
                      </legend>
                      {GUEST_GROUPS.map((group) => {
                        const on = (card.groups ?? []).includes(group.id);
                        return (
                          <label key={group.id} className={styles.group}>
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={(e) =>
                                setField(
                                  index,
                                  'groups',
                                  e.target.checked
                                    ? [...(card.groups ?? []), group.id]
                                    : (card.groups ?? []).filter(
                                        (g) => g !== group.id,
                                      ),
                                )
                              }
                            />
                            <span>{group.label}</span>
                          </label>
                        );
                      })}
                      {/* Said plainly, because the safe reading is also the
                          surprising one. */}
                      {(card.groups ?? []).length === 0 && (
                        <small className={styles.hint}>
                          {COPY.subGroupsNone}
                        </small>
                      )}
                    </fieldset>
                  )}
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
