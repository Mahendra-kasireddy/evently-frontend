import { ChevronDown, MapPin, Sparkles } from 'lucide-react';
import {
  COUNTDOWN_BLOCK,
  GUEST_COPY as COPY,
  HEADER_BLOCK,
  SAVE_THE_DATE_BLOCK,
  daysUntil,
  longDateLabel,
  timeLabel,
} from '../constants';
import type { InvitationBlock, InvitationDetails, InvitationTemplate } from '../types';
import styles from './GuestPreview.module.css';

export interface GuestPreviewProps {
  details: InvitationDetails;
  blocks: InvitationBlock[];
  templates: InvitationTemplate[];
  /** Shown in the hero until the hosts' names have been filled in. */
  fallbackName: string;
}

/**
 * What a guest sees, rendered from the same record both sides edit — so neither
 * the organizer's builder nor the customer's review screen can ever preview
 * something the invitation does not actually contain. Hidden sections are
 * omitted exactly as they will be for guests.
 */
export function GuestPreview({ details, blocks, templates, fallbackName }: GuestPreviewProps) {
  const template = templates.find((t) => t.id === details.template) ?? templates[0];
  const visible = blocks.filter((b) => !b.hidden);

  if (visible.length === 0) {
    return <p className={styles.previewEmpty}>{COPY.previewEmpty}</p>;
  }

  const names = [details.hostOne, details.hostTwo].filter(Boolean);
  const dateLine = longDateLabel(details.eventDate);
  const time = timeLabel(details.eventTime);
  const days = daysUntil(details.eventDate);

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
          return (
            <section key={block.key} className={styles.gCountdown}>
              <div className={styles.gSectionTitle} style={{ color: template?.accent }}>
                {block.heading || block.title}
              </div>
              <div className={styles.gCountRow}>
                <span className={styles.gCountBox}>
                  <strong>{days}</strong>
                  days
                </span>
                {time && (
                  <span className={styles.gCountBox}>
                    <strong>{time}</strong>
                    start
                  </span>
                )}
              </div>
              {block.body && <p className={styles.gBody}>{block.body}</p>}
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
