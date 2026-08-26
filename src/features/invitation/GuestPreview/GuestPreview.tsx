import { ChevronDown, MapPin, Sparkles } from 'lucide-react';
import {
  COUNTDOWN_BLOCK,
  GUEST_COPY as COPY,
  HEADER_BLOCK,
  SAVE_THE_DATE_BLOCK,
  longDateLabel,
  timeLabel,
} from '../constants';
import { pad2 } from '../countdown';
import { useCountdown } from '../useCountdown';
import { SaveTheDateCards } from './SaveTheDateCards';
import type {
  CardColour,
  InvitationBlock,
  InvitationDetails,
  InvitationSubEvent,
  InvitationTemplate,
} from '../types';
import styles from './GuestPreview.module.css';

export interface GuestPreviewProps {
  details: InvitationDetails;
  blocks: InvitationBlock[];
  templates: InvitationTemplate[];
  /** The Save-the-Date cards, in the organizer's order. */
  subEvents: InvitationSubEvent[];
  cardPalette: CardColour[];
  /** Duration a calendar entry gets when a card has no end time. */
  defaultSubEventMinutes: number;
  /** Shown in the hero until the hosts' names have been filled in. */
  fallbackName: string;
}

/**
 * What a guest sees, rendered from the same record both sides edit — so neither
 * the organizer's builder nor the customer's review screen can ever preview
 * something the invitation does not actually contain. Hidden sections are
 * omitted exactly as they will be for guests.
 */
export function GuestPreview({
  details,
  blocks,
  templates,
  subEvents,
  cardPalette,
  defaultSubEventMinutes,
  fallbackName,
}: GuestPreviewProps) {
  const template = templates.find((t) => t.id === details.template) ?? templates[0];
  const visible = blocks.filter((b) => !b.hidden);

  /*
   * Live, ticking every second, resolved against the event's own timezone —
   * so a guest abroad sees the real time remaining, not their own local
   * arithmetic. Once it passes, the organizer's post-event message takes the
   * block's place.
   */
  const countdown = useCountdown(details.eventDate, details.eventTime, details.timezone);

  if (visible.length === 0) {
    return <p className={styles.previewEmpty}>{COPY.previewEmpty}</p>;
  }

  const names = [details.hostOne, details.hostTwo].filter(Boolean);
  /** The event, named — the hosts if given, else the booking title. */
  const heroName = names.length > 0 ? names.join(` ${details.joiner || "and"} `) : fallbackName;
  const dateLine = longDateLabel(details.eventDate);
  const time = timeLabel(details.eventTime);

  return (
    <div className={styles.guest} style={{ background: template?.wash ?? '#fbf7f1' }}>
      {visible.map((block) => {
        if (block.key === HEADER_BLOCK) {
          return (
            <section
              key={block.key}
              className={styles.gHero}
              style={{ background: template?.hero ?? 'var(--c-navy)' }}
            >
              <span className={styles.gPill}>
                <Sparkles size={11} /> {COPY.youreInvited}
              </span>
              <div className={styles.gHeroBody}>
                {details.eyebrow && <div className={styles.gEyebrow}>{details.eyebrow}</div>}
                {names.length > 0 ? (
                  <div className={styles.gNames}>
                    <span className={styles.gName}>{names[0]}</span>
                    {names.length > 1 && (
                      <>
                        <span className={styles.gJoiner}>{details.joiner}</span>
                        <span className={styles.gName}>{names[1]}</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className={styles.gNames}>
                    <span className={styles.gName}>{block.heading || fallbackName}</span>
                  </div>
                )}
                {dateLine && <div className={styles.gDate}>{dateLine}</div>}
                {(details.venueName || details.venueAddress) && (
                  <div className={styles.gVenue}>
                    <MapPin size={12} />
                    {[details.venueName, details.venueAddress]
                      .filter((v, i, a) => v && a.indexOf(v) === i)
                      .join(' · ')}
                  </div>
                )}
                {details.message && <p className={styles.gMessage}>“{details.message}”</p>}
              </div>
              <span className={styles.gScroll}>
                {COPY.scroll}
                <ChevronDown size={14} />
              </span>
            </section>
          );
        }

        if (block.key === COUNTDOWN_BLOCK) {
          const eventName = heroName;
          /*
           * No date on the record yet. A row of zeros would read to a guest as
           * "starting right now", and the post-event message would be worse
           * still, so until there is a date the section shows only what the
           * organizer wrote.
           */
          const unscheduled = countdown.targetMs === null;
          return (
            <section key={block.key} className={styles.gCountdown}>
              <div className={styles.gSectionTitle} style={{ color: template?.accent }}>
                {block.heading || block.title}
              </div>

              {/* The event being counted down to, named. */}
              {eventName && <p className={styles.gCountName}>{eventName}</p>}

              {unscheduled ? (
                block.body && <p className={styles.gBody}>{block.body}</p>
              ) : countdown.passed ? (
                <p className={styles.gCountOver} role="status">
                  {details.postEventMessage || block.body || COPY.eventStarted}
                </p>
              ) : (
                <>
                  <div className={styles.gCountRow} role="timer" aria-live="off">
                    <span className={styles.gCountBox}>
                      <strong>{countdown.days}</strong>
                      days
                    </span>
                    <span className={styles.gCountBox}>
                      <strong>{pad2(countdown.hours)}</strong>
                      hrs
                    </span>
                    <span className={styles.gCountBox}>
                      <strong>{pad2(countdown.minutes)}</strong>
                      min
                    </span>
                    <span className={styles.gCountBox}>
                      <strong>{pad2(countdown.seconds)}</strong>
                      sec
                    </span>
                  </div>
                  {time && <p className={styles.gCountStart}>Starts {time}</p>}
                  {block.body && <p className={styles.gBody}>{block.body}</p>}
                </>
              )}
            </section>
          );
        }

        /*
         * One card per sub-event, replacing what used to be a single line of
         * date-time-venue text. The old line is still the fallback for an
         * invitation whose organizer has not added any sub-events, so nothing
         * regresses for a booking created before cards existed.
         */
        if (block.key === SAVE_THE_DATE_BLOCK && subEvents.length > 0) {
          return (
            <section key={block.key} className={styles.gSection}>
              <div className={styles.gSectionTitle} style={{ color: template?.accent }}>
                {block.heading || block.title}
              </div>
              {block.body && <p className={styles.gBody}>{block.body}</p>}
              <SaveTheDateCards
                subEvents={subEvents}
                cardPalette={cardPalette}
                template={template}
                defaultMinutes={defaultSubEventMinutes}
                invitationName={heroName}
              />
            </section>
          );
        }

        return (
          <section key={block.key} className={styles.gSection}>
            <div className={styles.gSectionTitle} style={{ color: template?.accent }}>
              {block.heading || block.title}
            </div>
            {block.body ? (
              <p className={styles.gBody}>{block.body}</p>
            ) : (
              dateLine &&
              block.key === SAVE_THE_DATE_BLOCK && (
                <p className={styles.gBody}>
                  {dateLine}
                  {time ? ` · ${time}` : ''}
                  {details.venueName ? ` · ${details.venueName}` : ''}
                </p>
              )
            )}
          </section>
        );
      })}
    </div>
  );
}

export default GuestPreview;
