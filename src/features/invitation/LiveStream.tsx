import { useRef, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Eye,
  Glasses,
  Maximize2,
  MapPin,
  MonitorPlay,
  Radio,
  Rotate3d,
  Shirt,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CornerBloom } from './Ornaments';
import { LIVE_COPY as COPY, timeLabel } from './constants';
import { cardDateLabel } from './subEvents';
import type { GuestLive, LiveModeId } from './types';

/** The card's own decoration, in the invitation's blush and gold. */
const PETAL = '#f3cfc0';
const STEM = '#b0852b';

/** Each way of watching has a mark, so the row reads before it is read. */
const MODE_ICON: Record<LiveModeId, LucideIcon> = {
  standard: MonitorPlay,
  '360': Rotate3d,
  vr: Glasses,
};
import styles from './LiveStream.module.css';

/**
 * The live stream, as three pieces of one invitation.
 *
 * A badge, a card in the flow, and a section with the player — plus the banner
 * for a guest whose invitation was already open when the stream started. They
 * share this file because they share one state and one vocabulary; splitting
 * them would mean four files agreeing on what "live" looks like.
 *
 * Nothing here decides whether a guest may watch. The server hands the client
 * a stream or null, so a guest who was not invited to the ceremony has nothing
 * to reveal by reading the page.
 */

/** The red dot and the word, used by every piece below. */
export function LiveBadge({ on = true, label }: { on?: boolean; label?: string }) {
  return (
    <span className={`${styles.badge} ${on ? '' : styles.badgeOff}`}>
      <i className={styles.pulse} aria-hidden="true" />
      {label ?? COPY.live}
    </span>
  );
}

export interface LiveBannerProps {
  live: GuestLive;
  onWatch: () => void;
  onDismiss: () => void;
}

/**
 * The notice for an invitation that was already open.
 *
 * Sticky rather than a second pop-up: the guest is already reading, and
 * covering what they are reading to tell them about something further down
 * the same page is the interruption the pop-up exists to avoid repeating.
 */
export function LiveBanner({ live, onWatch, onDismiss }: LiveBannerProps) {
  return (
    <div className={styles.banner} role="status">
      <div className={styles.bannerText}>
        <LiveBadge label={COPY.liveNow} />
        <p className={styles.bannerLine}>
          <span className={styles.bannerName}>{live.name}</span>{' '}
          {COPY.happeningNow}
        </p>
      </div>
      <button type="button" className={styles.bannerWatch} onClick={onWatch}>
        {COPY.watch}
        <ArrowRight size={14} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={styles.bannerClose}
        onClick={onDismiss}
        aria-label={COPY.bannerClose}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export interface LiveEntryCardProps {
  live: GuestLive;
  onOpen: () => void;
}

/** The row in the invitation that says there is a stream, and takes you to it. */
export function LiveEntryCard({ live, onOpen }: LiveEntryCardProps) {
  return (
    <button type="button" className={styles.entry} onClick={onOpen}>
      <span className={styles.entryMark}>
        <Radio size={18} strokeWidth={1.7} aria-hidden="true" />
      </span>
      <span className={styles.entryText}>
        <span className={styles.entryTitle}>{COPY.sectionTitle}</span>
        <span className={styles.entryHint}>{live.title}</span>
      </span>
      <LiveBadge />
      <ChevronRight size={18} className={styles.entryChevron} aria-hidden="true" />
    </button>
  );
}

export interface LiveStreamBlockProps {
  live: GuestLive;
  /**
   * Guests of this invitation watching the same event right now.
   *
   * Omitted on the customer's review screen, which is not a guest and so has
   * no count to report — the figure is then left off rather than shown as a
   * zero that would read as "nobody came".
   */
  watching?: number | undefined;
  /** The anchor the banner and the entry card scroll to. */
  id?: string;
}

/**
 * The section: which event, how many are watching, how to watch, the player,
 * and the event's own details underneath.
 *
 * The mode controls are drawn from `live.modes`, which the server built from
 * the urls the organizer actually supplied — so a 360° button is only ever
 * offered when there is a 360° feed behind it. A control that silently plays
 * the flat stream would teach the guest the app is lying to them.
 */
export function LiveStreamBlock({ live, watching, id }: LiveStreamBlockProps) {
  const [mode, setMode] = useState<LiveModeId>(
    () => live.modes[0]?.id ?? 'standard',
  );
  const player = useRef<HTMLDivElement>(null);

  /*
   * The chosen mode, or the first one when it is not on offer.
   *
   * Resolved here rather than reset by an effect: a stream repointed at
   * another event may not carry a 360° feed, and falling back while
   * rendering means the player is never briefly pointed at a url that is
   * gone. `current.id` is therefore the mode that is actually playing, which
   * is what the controls read from.
   */
  const current = live.modes.find((m) => m.id === mode) ?? live.modes[0];
  if (!current) return null;

  const when = cardDateLabel(live.eventDate);
  const at = timeLabel(live.eventTime);
  const venue = [live.venueName, live.venueAddress]
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .join(', ');

  const expand = () => {
    /* The browser's own full screen, on the element that is already playing.
       A second player in a dialog would be a second connection to the same
       stream, and would restart it from wherever the platform decides. */
    void player.current?.requestFullscreen?.();
  };

  return (
    <section className={styles.card} id={id} aria-label={COPY.sectionTitle}>
      {/* Behind everything, at the two corners the reference decorates. */}
      <span className={styles.bloomTop}>
        <CornerBloom petal={PETAL} stem={STEM} size={104} />
      </span>
      <span className={styles.bloomBottom}>
        <CornerBloom petal={PETAL} stem={STEM} size={88} flip />
      </span>

      <div className={styles.head}>
        <h2 className={styles.heading}>{COPY.sectionTitle}</h2>
      </div>

      <div className={styles.state}>
        <LiveBadge />
        {watching !== undefined && (
          <span className={styles.watching}>
            <Eye size={13} aria-hidden="true" />
            {COPY.watching(watching)}
          </span>
        )}
      </div>

      <p className={styles.title}>{live.name}</p>

      {/* Only drawn when there is a choice to make. */}
      {live.modes.length > 1 && (
        <div className={styles.modes} role="group" aria-label={COPY.modeLabel}>
          {live.modes.map((m) => {
            const Icon = MODE_ICON[m.id];
            return (
              <button
                key={m.id}
                type="button"
                className={`${styles.mode} ${m.id === current.id ? styles.modeOn : ''}`}
                onClick={() => setMode(m.id)}
                aria-pressed={m.id === current.id}
              >
                <Icon size={15} strokeWidth={1.7} aria-hidden="true" />
                {COPY.modes[m.id]}
              </button>
            );
          })}
        </div>
      )}

      <div className={styles.player} ref={player}>
        <iframe
          /* Keyed by url so switching mode swaps the feed rather than leaving
             the previous one running behind the new src. */
          key={current.url}
          className={styles.frame}
          src={current.url}
          title={`${COPY.playerLabel} — ${live.name}`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen; gyroscope; accelerometer; xr-spatial-tracking"
          allowFullScreen
          /* The url is on the server's allowlist, and this is what keeps a
             player from acting as the invitation's own origin regardless. */
          sandbox="allow-scripts allow-same-origin allow-presentation"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        {/*
         * A LIVE marker over the player, and full screen.
         *
         * Only these two. The reference draws a transport bar under the
         * picture — pause, volume, picture-in-picture — and that bar belongs
         * to the player inside the frame: this is a cross-origin iframe, so
         * nothing out here can drive it. Drawing the buttons anyway would be
         * three controls that do nothing. Full screen is the one that really
         * works, because it acts on our own element.
         */}
        <span className={styles.playerLive}>
          <i className={styles.pulse} aria-hidden="true" />
          {COPY.live}
        </span>
        <button
          type="button"
          className={styles.expand}
          onClick={expand}
          aria-label={COPY.fullScreen}
        >
          <Maximize2 size={14} aria-hidden="true" />
        </button>
      </div>

      {(when || venue || live.dressCode) && (
        <div className={styles.details}>
          <span className={styles.detailsBloom}>
            <CornerBloom petal={PETAL} stem={STEM} size={74} />
          </span>
          <span className={styles.detailsBloomLow}>
            <CornerBloom petal={PETAL} stem={STEM} size={62} flip />
          </span>

          <h3 className={styles.detailsHead}>{COPY.eventDetails}</h3>
          {when && (
            <p className={styles.fact}>
              <span className={styles.factTile}>
                <CalendarDays size={15} aria-hidden="true" />
              </span>
              <span>
                {when}
                {at && <i className={styles.sep} aria-hidden="true" />}
                {at}
              </span>
            </p>
          )}
          {venue && (
            <p className={styles.fact}>
              <span className={styles.factTile}>
                <MapPin size={15} aria-hidden="true" />
              </span>
              <span>{venue}</span>
            </p>
          )}
          {live.dressCode && (
            <p className={styles.fact}>
              <span className={styles.factTile}>
                <Shirt size={15} aria-hidden="true" />
              </span>
              <span>
                <span className={styles.factLabel}>{COPY.dressCode}</span>
                {live.dressCode}
              </span>
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default LiveStreamBlock;
