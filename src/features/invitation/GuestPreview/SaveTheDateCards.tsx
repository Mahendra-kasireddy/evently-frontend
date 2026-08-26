import { CalendarPlus, Clock3, MapPin, Shirt } from 'lucide-react';
import {
  buildIcs,
  googleCalendarUrl,
  icsFileName,
  prefersAppleCalendar,
  type CalendarContext,
  type CalendarEvent,
} from '../calendar';
import { GUEST_COPY as COPY, timeLabel } from '../constants';
import { cardDateLabel, cardStyle, dayOfWeekLabel, guestSubEvents, mapsUrl } from '../subEvents';
import type { CardColour, InvitationSubEvent, InvitationTemplate } from '../types';
import styles from './GuestPreview.module.css';

export interface SaveTheDateCardsProps {
  subEvents: InvitationSubEvent[];
  cardPalette: CardColour[];
  template: InvitationTemplate | undefined;
  /** Duration a calendar entry gets when a card has no end time. */
  defaultMinutes: number;
  /** The celebration these cards belong to, named inside the calendar entry. */
  invitationName: string;
}

/**
 * Hands one card to whatever calendar this device has.
 *
 * Not a link, because which handoff is right depends on the device and that is
 * only knowable at the moment of the tap — reading the user agent during render
 * would also make the render impure. Nothing is added until the guest confirms
 * in their own calendar app, which is what makes dismissing the prompt a no-op.
 */
function handOff(event: CalendarEvent, ctx: CalendarContext): void {
  if (!prefersAppleCalendar(window.navigator.userAgent, window.navigator.maxTouchPoints)) {
    const url = googleCalendarUrl(event, ctx);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  const ics = buildIcs(event, ctx, Date.now());
  if (!ics) return;

  /*
   * A Blob rather than a `data:` URL: iOS will not hand a `data:text/calendar`
   * URL to Calendar, and a long note would otherwise run into URL length
   * limits. The object URL is revoked on a timer because revoking it
   * synchronously cancels the download in Safari.
   */
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = icsFileName(event);
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 10_000);
}

/** The card fields the calendar needs, without the presentation-only ones. */
function toCalendarEvent(sub: InvitationSubEvent): CalendarEvent {
  return {
    id: sub.id,
    name: sub.name,
    eventDate: sub.eventDate,
    eventTime: sub.eventTime,
    endTime: sub.endTime,
    timezone: sub.timezone,
    venueName: sub.venueName,
    venueAddress: sub.venueAddress,
    dressCode: sub.dressCode,
    note: sub.note,
  };
}

/**
 * One Save-the-Date card per sub-event, each with its own calendar handoff.
 *
 * Rendered in the order the organizer arranged them rather than sorted by date:
 * the builder's order is a deliberate choice, and a mehendi listed before a
 * ceremony on the same day carries information a sort would throw away.
 */
export function SaveTheDateCards({
  subEvents,
  cardPalette,
  template,
  defaultMinutes,
  invitationName,
}: SaveTheDateCardsProps) {
  const cards = guestSubEvents(subEvents);
  if (cards.length === 0) {
    return <p className={styles.gBody}>{COPY.noSubEvents}</p>;
  }

  const ctx: CalendarContext = { invitationName, defaultMinutes };

  return (
    <ul className={styles.gCards}>
      {cards.map((sub, index) => {
        const style = cardStyle(sub.colour, cardPalette, template);
        const event = toCalendarEvent(sub);
        // Doubles as the "is this card addable" test: no date, no entry.
        const googleUrl = googleCalendarUrl(event, ctx);
        const directions = mapsUrl(sub.venueName, sub.venueAddress);
        const day = dayOfWeekLabel(sub.eventDate);
        const date = cardDateLabel(sub.eventDate);
        const time = timeLabel(sub.eventTime);
        const endsAt = timeLabel(sub.endTime);

        return (
          <li
            key={sub.id || `${sub.name}-${index}`}
            className={styles.gCard}
            style={{
              background: style.background,
              color: style.color,
              borderColor: style.border,
            }}
          >
            <h4 className={styles.gCardName}>{sub.name}</h4>

            {(day || date) && (
              <div className={styles.gCardWhen}>
                {day && <span className={styles.gCardDay}>{day}</span>}
                {date && <span className={styles.gCardDate}>{date}</span>}
              </div>
            )}

            {time && (
              <div className={styles.gCardLine}>
                <Clock3 size={12} />
                <span>
                  {time}
                  {endsAt ? ` – ${endsAt}` : ''}
                </span>
              </div>
            )}

            {sub.venueName && (
              <div className={styles.gCardLine}>
                <MapPin size={12} />
                {directions ? (
                  <a
                    className={styles.gCardLink}
                    href={directions}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: style.color }}
                  >
                    {sub.venueName}
                  </a>
                ) : (
                  <span>{sub.venueName}</span>
                )}
              </div>
            )}

            {sub.dressCode && (
              <div className={styles.gCardLine}>
                <Shirt size={12} />
                <span>
                  {COPY.dressCode}: {sub.dressCode}
                </span>
              </div>
            )}

            {sub.note && <p className={styles.gCardNote}>{sub.note}</p>}

            <div className={styles.gCardActions}>
              <button
                type="button"
                className={styles.gCardBtn}
                style={{ borderColor: style.color, color: style.color }}
                onClick={() => handOff(event, ctx)}
                disabled={googleUrl === null}
                title={googleUrl === null ? 'This event has no date yet' : undefined}
              >
                <CalendarPlus size={13} />
                {COPY.addToCalendar}
              </button>
              {/*
                The platform pick above is a guess. This is the escape hatch for
                when it guesses wrong — an Android guest who wants the file, or
                an iPhone guest who lives in Google Calendar.
              */}
              {googleUrl !== null && (
                <a
                  className={styles.gCardAlt}
                  href={googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: style.color }}
                >
                  {COPY.addToGoogle}
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default SaveTheDateCards;
