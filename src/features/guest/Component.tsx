import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { GuestPreview } from '@features/invitation';
import { GUEST_PAGE_COPY as COPY } from './constants';
import type { GuestInvitation } from './service';
import styles from './styles.module.css';

export interface GuestComponentProps {
  invitation: GuestInvitation;
  /** The block key the share link pointed at, or '' for the whole invitation. */
  section: string;
}

/**
 * The published invitation as a guest reads it.
 *
 * One page for every share. A section link does not open a different document —
 * it opens this one and brings that section into view, which is why there is no
 * per-section route and no second invitation record anywhere behind it.
 */
export function GuestComponent({ invitation, section }: GuestComponentProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [highlighted, setHighlighted] = useState('');

  const sectionTitle = invitation.blocks.find((b) => b.key === section)?.title ?? '';

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
        {invitation.guest.name ? COPY.greeting(invitation.guest.name) : COPY.greetingAnon}
      </p>

      {section && sectionTitle && (
        <span className={styles.jumped}>{COPY.jumpedTo(sectionTitle)}</span>
      )}

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
    </main>
  );
}

export default GuestComponent;
