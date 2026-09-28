import {
  CalendarDays,
  CalendarPlus,
  Clock3,
  MapPin,
  Shirt,
} from 'lucide-react';
import {
  googleCalendarUrl,
  handOffToCalendar,
  toCalendarEvent,
  type CalendarContext,
} from './calendar';
import { SAVE_THE_DATE_COPY as COPY, timeLabel } from './constants';
import { Flourish } from './Ornaments';
import { cardDateLabel, cardStyle, dayOfWeekLabel, mapsUrl } from './subEvents';
import type {
  CardColour,
  InvitationSubEvent,
  InvitationTemplate,
} from './types';
import styles from './SaveTheDate.module.css';

export interface SaveTheDateProps {
  /**
   * The cards this guest may see. Already filtered by the server — a card the
   * guest is not invited to never reaches the browser, so there is nothing to
   * filter here and nothing a client could switch back on.
   */
  subEvents: InvitationSubEvent[];
  cardPalette: CardColour[];
  template: InvitationTemplate | undefined;
  /** Duration a calendar entry gets when a card has no end time. */
  defaultMinutes: number;
  /** The celebration these cards belong to, named inside the calendar entry. */
  invitationName: string;
}

const GOLD = '#b0852b';

/** One celebration, and the one thing a guest wants to do about it. */
function Card({
  sub,
  index,
  ctx,
  palette,
  template,
}: {
  sub: InvitationSubEvent;
  index: number;
  ctx: CalendarContext;
  palette: CardColour[];
  template: InvitationTemplate | undefined;
}) {
  const style = cardStyle(sub.colour, palette, template);
  const event = toCalendarEvent(sub);
  /* Doubles as the "is this card addable" test: no date, no entry. */
  const googleUrl = googleCalendarUrl(event, ctx);
  const directions = mapsUrl(sub.venueName, sub.venueAddress);

  const day = dayOfWeekLabel(sub.eventDate);
  const date = cardDateLabel(sub.eventDate);
  const time = timeLabel(sub.eventTime);
  const endsAt = timeLabel(sub.endTime);

  return (
    <li
      className={styles.card}
      style={{ background: style.background, borderColor: style.border }}
    >
      {/* The card's own colour, as a hairline rather than a fill: it marks the
          celebration without turning the card into a coloured block. */}
      <i
        className={styles.edge}
        style={{ background: style.color }}
        aria-hidden="true"
      />

      <h3 className={styles.name} style={{ color: style.color }}>
        {sub.name}
      </h3>

      {(day || date) && (
        <p className={styles.when}>
          <CalendarDays size={14} aria-hidden="true" />
          <span>
            {day}
            {day && date ? ' · ' : ''}
            {date}
          </span>
        </p>
      )}

      {time && (
        <p className={styles.line}>
          <Clock3 size={14} aria-hidden="true" />
          <span>
            {time}
            {endsAt ? ` – ${endsAt}` : ''}
          </span>
        </p>
      )}

      <i
        className={styles.rule}
        style={{ background: style.color }}
        aria-hidden="true"
      />

      {sub.venueName && (
        <p className={styles.line}>
          <MapPin size={14} aria-hidden="true" />
          <span>
            {/* The venue opens the map when there is an address to open. */}
            {directions ? (
              <a
                className={styles.link}
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
              >
                {sub.venueName}
              </a>
            ) : (
              sub.venueName
            )}
            {sub.venueAddress && sub.venueAddress !== sub.venueName && (
              <span className={styles.address}>{sub.venueAddress}</span>
            )}
          </span>
        </p>
      )}

      {sub.dressCode && (
        <p className={styles.line}>
          <Shirt size={14} aria-hidden="true" />
          <span>
            <span className={styles.label}>{COPY.dressCode}</span>
            <span className={styles.address}>{sub.dressCode}</span>
          </span>
        </p>
      )}

      {sub.note && (
        <p className={styles.note} style={{ color: style.color }}>
          {sub.note}
        </p>
      )}

      <button
        type="button"
        className={styles.add}
        style={{ background: style.color }}
        onClick={() => handOffToCalendar(event, ctx)}
        disabled={googleUrl === null}
        /* A card with no date has nothing to put in a calendar; saying so
           beats a button that silently does nothing. */
        title={googleUrl === null ? COPY.noDate : undefined}
      >
        <CalendarPlus size={16} aria-hidden="true" />
        {COPY.add}
      </button>

      {/*
        The platform pick inside the handoff is a guess from the user agent.
        This is the escape hatch for when it guesses wrong — an Android guest
        who wants the file, or an iPhone guest who lives in Google Calendar.
      */}
      {googleUrl !== null && (
        <a
          className={styles.alt}
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {COPY.addToGoogle}
        </a>
      )}

      <span className={styles.index} aria-hidden="true">
        {index + 1}
      </span>
    </li>
  );
}

/** The cards alone, for a surface that supplies its own heading. */
export function SaveTheDateCards({
  subEvents,
  cardPalette,
  template,
  defaultMinutes,
  invitationName,
}: SaveTheDateProps) {
  if (subEvents.length === 0) return null;
  const ctx: CalendarContext = { invitationName, defaultMinutes };

  return (
    <ul className={styles.cards}>
      {subEvents.map((sub, index) => (
        <Card
          key={sub.id || `${sub.name}-${index}`}
          sub={sub}
          index={index}
          ctx={ctx}
          palette={cardPalette}
          template={template}
        />
      ))}
    </ul>
  );
}

/**
 * Save the Date: one card per celebration this guest is invited to.
 *
 * An itinerary rather than a list — each card carries the one celebration and
 * the one thing a guest wants to do about it, which is put it in their diary.
 *
 * Stacked rather than swiped: a guest reads these once, in order, and a
 * carousel would hide the later celebrations behind a gesture nobody is told
 * about. The story is swiped because a story has a sequence; an itinerary is
 * read.
 */
export function SaveTheDateBlock(
  props: SaveTheDateProps & { accent?: string | undefined },
) {
  /*
   * The visibility rule: no cards, no block. Not an empty frame and not a
   * heading over nothing — a guest invited to no listed celebration simply
   * does not have this section.
   */
  if (props.subEvents.length === 0) return null;
  const gold = props.accent || GOLD;

  return (
    <section className={styles.block} aria-label={COPY.title}>
      <span className={styles.flourish}>
        <Flourish color={gold} />
      </span>
      <h2 className={styles.title}>{COPY.title}</h2>
      <p className={styles.lead}>{COPY.lead}</p>
      <SaveTheDateCards {...props} />
    </section>
  );
}

export default SaveTheDateBlock;
