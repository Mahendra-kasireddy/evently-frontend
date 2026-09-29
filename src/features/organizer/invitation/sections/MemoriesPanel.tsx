import { useRef, useState } from 'react';
import { ImagePlus, Play } from 'lucide-react';
import { Btn } from '@shared/partner';
import { Lightbox } from '@features/invitation';
import { INVITATION_COPY as COPY } from '../constants';
import { IMAGE_TYPES, VIDEO_TYPES } from '../artwork';
import type { OrganizerGallery } from '../service';
import styles from '../styles.module.css';

export interface MemoriesPanelProps {
  gallery: OrganizerGallery | undefined;
  kind: string;
  subEvent: string;
  busy: boolean;
  /** One line about the last upload, already worded by the server. */
  say: string;
  sayWarn: boolean;
  onKind: (kind: string) => void;
  onSubEvent: (id: string) => void;
  onAdd: (file: File) => void;
}

/** `95` → `1:35`. */
function clock(seconds: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Shared Memories, on the organizer's side.
 *
 * Deliberately two things and no more: see the gallery, and add a photograph
 * to it. The organizer is at the celebration with a camera and their pictures
 * belong with everyone else's — but whether the gallery exists, who may
 * download from it and what is approved or removed are the customer's
 * decisions about the customer's own photographs, and there is no route here
 * to any of them.
 */
export function MemoriesPanel({
  gallery,
  kind,
  subEvent,
  busy,
  say,
  sayWarn,
  onKind,
  onSubEvent,
  onAdd,
}: MemoriesPanelProps) {
  const input = useRef<HTMLInputElement>(null);
  const [viewing, setViewing] = useState(-1);

  const items = gallery?.items ?? [];
  const counts = gallery?.counts ?? { all: 0, photo: 0, video: 0, reel: 0 };
  const open = viewing >= 0 ? items[viewing] : undefined;

  const tabs: Array<[string, string, number]> = [
    ['all', COPY.memAll, counts.all],
    ['photo', COPY.memPhotos, counts.photo],
    ['video', COPY.memVideos, counts.video],
    ['reel', COPY.memReels, counts.reel],
  ];

  return (
    <section className={styles.story}>
      <div className={styles.storyHead}>
        <h3 className={styles.artworkTitle}>{COPY.memTitle}</h3>
        <span className={styles.storyTally}>{COPY.memTally(counts.all)}</span>
      </div>
      <p className={styles.artworkLead}>{COPY.memLead}</p>

      <div className={styles.memFilters} role="group" aria-label={COPY.memTabsLabel}>
        {tabs.map(([id, label, n]) => (
          <button
            key={id}
            type="button"
            className={`${styles.memChip} ${kind === id ? styles.memChipOn : ''}`}
            onClick={() => onKind(id)}
            aria-pressed={kind === id}
          >
            {label} {n}
          </button>
        ))}
      </div>

      {/* The celebrations come from this invitation, never a fixed list. */}
      {gallery && gallery.subEvents.length > 0 && (
        <div className={styles.memFilters} role="group" aria-label={COPY.memEventsLabel}>
          <button
            type="button"
            className={`${styles.memChip} ${subEvent === 'all' ? styles.memChipOn : ''}`}
            onClick={() => onSubEvent('all')}
            aria-pressed={subEvent === 'all'}
          >
            {COPY.memAllEvents}
          </button>
          {gallery.subEvents.map((e) => (
            <button
              key={e.id}
              type="button"
              className={`${styles.memChip} ${subEvent === e.id ? styles.memChipOn : ''}`}
              onClick={() => onSubEvent(e.id)}
              aria-pressed={subEvent === e.id}
            >
              {e.name}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <p className={styles.artworkNote}>{COPY.memEmpty}</p>
      ) : (
        <div className={styles.memGrid}>
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={styles.memCell}
              onClick={() => setViewing(index)}
              aria-label={COPY.memOpen(index + 1, items.length)}
            >
              {/* Thumbnails, never originals: a wedding gallery is thousands
                  of 12-megapixel files. */}
              <img
                className={styles.memThumb}
                src={item.thumbnailUrl}
                alt={item.caption || ''}
                loading="lazy"
                decoding="async"
              />
              {item.kind !== 'photo' && (
                <>
                  <span className={styles.memPlay}>
                    <Play size={20} fill="currentColor" aria-hidden="true" />
                  </span>
                  {item.durationSec > 0 && (
                    <span className={styles.memLength}>{clock(item.durationSec)}</span>
                  )}
                </>
              )}
              {item.moderationStatus === 'awaiting' && (
                <span className={styles.memState}>{COPY.memWaiting}</span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className={styles.storyBar}>
        <Btn
          kind="outline"
          sm
          icon={<ImagePlus size={14} />}
          onClick={() => input.current?.click()}
          disabled={busy}
        >
          {busy ? COPY.memAdding : COPY.memAdd}
        </Btn>
        <span className={styles.artworkState}>{COPY.memOwnerNote}</span>
      </div>

      <input
        ref={input}
        type="file"
        accept={`${IMAGE_TYPES},${VIDEO_TYPES}`}
        className={styles.fileInput}
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Cleared so choosing the same file twice still fires a change event.
          e.target.value = '';
          if (file) onAdd(file);
        }}
      />

      {say && (
        <p className={sayWarn ? styles.artworkError : styles.artworkNote} role="status">
          {say}
        </p>
      )}

      <Lightbox open={Boolean(open)} onClose={() => setViewing(-1)} label={COPY.memClose}>
        {open &&
          (open.kind === 'photo' ? (
            /* The display rendition, not the original. */
            <img className={styles.lightboxMedia} src={open.displayUrl} alt={open.caption} />
          ) : (
            <video
              className={styles.lightboxMedia}
              src={open.url}
              controls
              preload="metadata"
            />
          ))}
      </Lightbox>
    </section>
  );
}

export default MemoriesPanel;
