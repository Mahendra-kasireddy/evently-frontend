import { useCallback, useRef, useState } from 'react';
import { Lightbox } from './Lightbox';
import { STORY_COPY as COPY } from './constants';
import type { InvitationStoryCard } from './types';
import styles from './StoryBlock.module.css';

export interface StoryBlockProps {
  /** In the organizer's saved order. Empty means the block does not exist. */
  cards: InvitationStoryCard[];
  /** What the organizer called the section, e.g. "Our Journey". */
  title: string;
  /** The invitation's accent, so the story belongs to the page around it. */
  accent?: string | undefined;
}

/**
 * The couple's story, told in photographs.
 *
 * A horizontal run of cards the guest swipes through rather than a gallery
 * they scroll past: a story has an order, and one card at a time is what makes
 * the order mean something.
 *
 * The swiping is the browser's own — CSS scroll-snap over a scroll container —
 * not a gesture library and not hand-written touch maths. That is what gives
 * it real momentum, real rubber-banding and the right feel on every device,
 * and it is why dragging the story sideways never drags the invitation
 * underneath it.
 */
export function StoryBlock({ cards, title, accent }: StoryBlockProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  /** Which card the viewer is showing; the story keeps its place behind it. */
  const [viewing, setViewing] = useState(0);

  /*
   * Which card is in view, read from where the track actually is rather than
   * from a counter this component increments. A guest can flick past three
   * cards at once, and a counter would then disagree with what they are
   * looking at.
   */
  const frame = useRef(0);
  const onScroll = useCallback(() => {
    /* One read per painted frame: a scroll fires far more often than the dots
       can meaningfully change, and setState on every event janks the swipe. */
    if (frame.current) return;
    frame.current = window.requestAnimationFrame(() => {
      frame.current = 0;
      const track = trackRef.current;
      if (!track) return;
      /* The card nearest the left edge, measured — not `scrollLeft` divided by
         a card width, which is wrong the moment there is a gap, padding, or a
         card of a different size. */
      let nearest = 0;
      let best = Infinity;
      Array.from(track.children).forEach((child, index) => {
        const offset = (child as HTMLElement).offsetLeft - track.offsetLeft;
        const distance = Math.abs(offset - track.scrollLeft);
        if (distance < best) {
          best = distance;
          nearest = index;
        }
      });
      setActive(nearest);
    });
  }, []);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (!track || !card) return;
    /* `prefers-reduced-motion` is honoured by the stylesheet's scroll-behavior,
       so this one call is right for both preferences. */
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft });
  }, []);

  /* Arrow keys move the story on a desktop, where there is nothing to swipe. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(Math.min(active + 1, cards.length - 1));
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(Math.max(active - 1, 0));
    }
  };

  /*
   * The visibility rule, and the only one: no cards, no block. Not an empty
   * frame, not a heading over nothing — an invitation with no story simply
   * does not have this section.
   */
  if (cards.length === 0) return null;

  return (
    <section
      className={styles.story}
      aria-roledescription="carousel"
      aria-label={title || COPY.title}
    >
      <h2
        className={styles.title}
        style={accent ? { color: accent } : undefined}
      >
        {title || COPY.title}
      </h2>

      <div
        ref={trackRef}
        className={styles.track}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="group"
        aria-label={COPY.trackLabel}
      >
        {cards.map((card, index) => (
          <article
            key={card.id}
            className={styles.card}
            aria-roledescription="slide"
            aria-label={COPY.slideLabel(index + 1, cards.length)}
          >
            <button
              type="button"
              className={styles.frame}
              onClick={() => {
                setViewing(index);
                setOpen(true);
              }}
              aria-label={COPY.openPhoto(index + 1)}
            >
              {/*
               * Lazily loaded and sized by the frame, so a twelve-card story
               * costs one image up front rather than twelve. `cover` crops to
               * the frame without ever stretching the photograph, which is
               * what lets portrait, landscape and square sit in one row.
               */}
              <img
                className={styles.photo}
                src={card.imageUrl}
                alt={card.caption || COPY.photoAlt(index + 1)}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                /* A deleted or unreachable photo hides its own frame rather
                   than printing a broken-image glyph into the invitation. */
                onError={(e) => {
                  e.currentTarget.style.visibility = 'hidden';
                }}
              />
            </button>
            {card.caption && <p className={styles.caption}>{card.caption}</p>}
          </article>
        ))}
      </div>

      {/*
       * Where the guest is in the story. Dots for the shape of it, and the
       * count in words beside them — dots alone are colour and position only,
       * which is not something a screen reader or a tired eye can count.
       */}
      <div className={styles.progress}>
        <div className={styles.dots}>
          {cards.map((card, index) => (
            <button
              key={card.id}
              type="button"
              className={`${styles.dot} ${index === active ? styles.dotOn : ''}`}
              onClick={() => goTo(index)}
              aria-label={COPY.goTo(index + 1)}
              aria-current={index === active ? 'true' : undefined}
            />
          ))}
        </div>
        <span className={styles.count} aria-live="polite">
          {COPY.position(active + 1, cards.length)}
        </span>
      </div>

      <Lightbox open={open} onClose={() => setOpen(false)} label={COPY.close}>
        <figure className={styles.viewer}>
          <img
            className={styles.viewerPhoto}
            src={cards[viewing]?.imageUrl}
            alt={cards[viewing]?.caption || COPY.photoAlt(viewing + 1)}
          />
          {cards[viewing]?.caption && (
            <figcaption className={styles.viewerCaption}>
              {cards[viewing].caption}
            </figcaption>
          )}
        </figure>
      </Lightbox>
    </section>
  );
}

export default StoryBlock;
