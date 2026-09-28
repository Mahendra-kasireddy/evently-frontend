import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import {
  artworkOf,
  CountdownBlock,
  GuestPreview,
  InvitationArtworkView,
  LiveBanner,
  LiveEntryCard,
  LiveStreamBlock,
  NotificationModal,
  SaveTheDateBlock,
  StoryBlock,
} from '@features/invitation';
import {
  useDismissGuestNotificationMutation,
  usePingGuestLiveMutation,
} from './service';
import { GUEST_PAGE_COPY as COPY } from './constants';
import type { GuestInvitation } from './service';
import styles from './styles.module.css';

/** The one id the banner, the entry card and the pop-up all scroll to. */
const LIVE_ANCHOR = 'live-stream';

export interface GuestComponentProps {
  invitation: GuestInvitation;
  /** The block key the share link pointed at, or '' for the whole invitation. */
  section: string;
  /** The guest's own credential, and what a dismissal is recorded against. */
  token: string;
}

/**
 * The published invitation as a guest reads it.
 *
 * One page for every share. A section link does not open a different document —
 * it opens this one and brings that section into view, which is why there is no
 * per-section route and no second invitation record anywhere behind it.
 */
export function GuestComponent({
  invitation,
  section,
  token,
}: GuestComponentProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [highlighted, setHighlighted] = useState('');

  /*
   * Whether the notice is raised was the server's decision; this only tracks
   * whether it is still on screen. Closed locally the moment it is dismissed,
   * so the guest is not waiting on a round trip to be rid of it — and recorded
   * on the server in the same breath, which is what makes it stay gone.
   */
  const notification = invitation.notification;
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [dismiss] = useDismissGuestNotificationMutation();
  const countdown = invitation.countdown;

  /*
   * The stream, when the server handed this guest one. Null covers both
   * "nothing is on" and "this guest is not invited to the event that is", and
   * the two are deliberately indistinguishable from here.
   */
  const live = invitation.live ?? null;
  const [bannerOpen, setBannerOpen] = useState(true);
  const [watching, setWatching] = useState(0);
  const [ping] = usePingGuestLiveMutation();

  /*
   * The viewer count, as a heartbeat.
   *
   * Once on arrival and then every 45 seconds while a stream is on — the
   * server counts a guest as watching for 90, so one missed beat is a slow
   * network and two is a closed tab. Nothing polls when nothing is live.
   */
  useEffect(() => {
    if (!live) return;
    let alive = true;
    const beat = () => {
      ping(token)
        .unwrap()
        .then((r) => {
          if (alive) setWatching(r.watching);
        })
        /* A count is the least important thing on the page; failing to get
           one is not worth telling the guest about. */
        .catch(() => undefined);
    };
    beat();
    const id = window.setInterval(beat, 45_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [live, token, ping]);

  /** Bring the player into view, from the banner, the card or the pop-up. */
  const goToLive = () => {
    setBannerOpen(false);
    document
      .getElementById(LIVE_ANCHOR)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  /* The template the rest of the invitation is drawn from, so the countdown
     card is ruled in the same accent and printed on the same wash. */
  const template = invitation.templates.find(
    (t) => t.id === invitation.details.template,
  );

  const sectionTitle =
    invitation.blocks.find((b) => b.key === section)?.title ?? '';
  /* The organizer's own design, when they uploaded one. It is the invitation,
     so it is what the guest gets; the composed sections remain for invitations
     built before the upload existed. */
  const artwork = artworkOf(invitation.details);

  useEffect(() => {
    if (!section || !sheetRef.current) return;

    /*
     * The guest render keys each section by its block key but does not put that
     * key in the DOM, so the target is found by position in the visible list —
     * the same list the server already filtered. Done in an effect because it
     * reads layout, and after a frame because the preview's own images and
     * fonts shift it.
     */
    const index = invitation.blocks.findIndex((b) => b.key === section);
    if (index < 0) return;

    const frame = window.requestAnimationFrame(() => {
      const target = sheetRef.current?.querySelectorAll('section')[index];
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHighlighted(section);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [section, invitation.blocks]);

  return (
    <main className={styles.page}>
      <div className={styles.bar}>
        <Sparkles size={13} /> {COPY.brand}
      </div>

      <p className={styles.greeting}>
        {invitation.guest.name
          ? COPY.greeting(invitation.guest.name)
          : COPY.greetingAnon}
      </p>

      {section && sectionTitle && (
        <span className={styles.jumped}>{COPY.jumpedTo(sectionTitle)}</span>
      )}

      {/*
       * For a guest whose invitation was already open when the stream started.
       * It is the pop-up's quieter twin: same news, without covering what they
       * were reading.
       */}
      {live && bannerOpen && (
        <LiveBanner
          live={live}
          onWatch={goToLive}
          onDismiss={() => setBannerOpen(false)}
        />
      )}

      {/* The stream, announced where the invitation itself is. */}
      {live && <LiveEntryCard live={live} onOpen={goToLive} />}

      {artwork ? (
        <InvitationArtworkView
          artwork={artwork}
          label={invitation.bookingTitle}
        />
      ) : (
        <div
          ref={sheetRef}
          className={`${styles.sheet} ${highlighted ? styles.highlight : ''}`}
        >
          <GuestPreview
            details={invitation.details}
            blocks={invitation.blocks}
            templates={invitation.templates}
            subEvents={invitation.subEvents}
            cardPalette={invitation.cardPalette}
            defaultSubEventMinutes={invitation.defaultSubEventMinutes}
            fallbackName={invitation.bookingTitle}
          />
        </div>
      )}

      {/*
       * The countdown, under the invitation. Independent of the notice above
       * it: turning the notice off does not stop the clock, and dismissing it
       * does not either.
       */}
      {countdown && (
        <CountdownBlock
          countdown={countdown}
          accent={template?.accent}
          wash={template?.wash}
          eyebrow={invitation.details.eyebrow}
        />
      )}

      {notification?.show && countdown && (
        <NotificationModal
          open={noticeOpen}
          notification={notification}
          countdown={countdown}
          onDismiss={() => {
            setNoticeOpen(false);
            /* Best effort: the guest is already rid of it on screen, and a
               failed write only means they may be asked once more. */
            dismiss({ token, kind: notification.kind });
          }}
          /* Only when there is somewhere to go — which is also what tells the
             card to draw its live face. */
          onWatch={
            notification.state === 'live' && live
              ? () => {
                  setNoticeOpen(false);
                  dismiss({ token, kind: notification.kind });
                  /* After the dialog has gone, so the scroll lands on a page
                     that is scrollable again. */
                  window.requestAnimationFrame(goToLive);
                }
              : undefined
          }
        />
      )}

      {/*
       * The player itself, under the invitation and above Save the Date: it is
       * the thing happening right now, and the cards below it are the things
       * that have not happened yet.
       */}
      {live && (
        <LiveStreamBlock live={live} watching={watching} id={LIVE_ANCHOR} />
      )}

      {/*
       * Save the Date: one card per celebration this guest is invited to. The
       * list arrives already filtered by the server, so nothing here decides
       * who sees what.
       */}
      <SaveTheDateBlock
        subEvents={invitation.subEvents}
        cardPalette={invitation.cardPalette}
        template={template}
        defaultMinutes={invitation.defaultSubEventMinutes}
        invitationName={invitation.bookingTitle}
        accent={template?.accent}
      />

      {/*
       * The story, under the invitation and inside the same scrolling page —
       * one block among the invitation's blocks, not a place of its own. It
       * renders itself away when there are no cards.
       */}
      <StoryBlock
        cards={invitation.storyCards ?? []}
        title={invitation.details.storyTitle ?? ''}
        accent={
          invitation.templates.find((t) => t.id === invitation.details.template)
            ?.accent
        }
      />
    </main>
  );
}

export default GuestComponent;
