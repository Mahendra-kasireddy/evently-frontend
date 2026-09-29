import { useRef, useState } from 'react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  ImagePlus,
  Play,
} from 'lucide-react';
import { Lightbox } from './Lightbox';
import { CornerBloom } from './Ornaments';
import { MEMORIES_COPY as COPY } from './constants';
import styles from './Memories.module.css';

const PETAL = '#f3cfc0';
const STEM = '#b0852b';

/** What the gallery needs, without knowing where it came from. */
export interface MemoryItem {
  id: string;
  kind: 'photo' | 'video' | 'reel';
  /** The original, for the download flow. Never rendered. */
  url: string;
  /** What the grid draws. */
  thumbnailUrl: string;
  /** What the viewer opens — not the original. */
  displayUrl: string;
  caption: string;
  durationSec: number;
  likes: number;
  likedByMe: boolean;
  mine: boolean;
  flags: string[];
  state: string;
}

export interface MemoriesBlockProps {
  items: MemoryItem[];
  counts: { all: number; photo: number; video: number; reel: number };
  subEvents: Array<{ id: string; name: string }>;
  kind: string;
  subEvent: string;
  /** Empty when this is the last page. */
  nextCursor: string;
  busy: boolean;
  canUpload: boolean;
  canDownload: boolean;
  /** One line about the last upload, already worded for a guest. */
  say: string;
  sayWarn: boolean;
  /** Set when the last upload was flagged and its uploader may keep it. */
  keepId: string;
  onKind: (kind: string) => void;
  onSubEvent: (id: string) => void;
  onMore: () => void;
  onAdd: (file: File, reel: boolean) => void;
  onKeep: (id: string) => void;
  onLike: (id: string, on: boolean) => void;
  onDownload: (id: string) => void;
}

/** `95` → `1:35`. */
function clock(seconds: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Shared Memories: everything the guests photographed, sorted.
 *
 * Two filters over one grid, and a viewer. Nothing here decides who sees what
 * — the page it is handed is already this guest's, chosen on the server — so
 * the tabs and the celebration chips are a request for a different page rather
 * than a filter over a list that arrived larger than it should have.
 */
export function MemoriesBlock({
  items,
  counts,
  subEvents,
  kind,
  subEvent,
  nextCursor,
  busy,
  canUpload,
  canDownload,
  say,
  sayWarn,
  keepId,
  onKind,
  onSubEvent,
  onMore,
  onAdd,
  onKeep,
  onLike,
  onDownload,
}: MemoriesBlockProps) {
  const photoInput = useRef<HTMLInputElement>(null);
  const reelInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(-1);

  const viewing = open >= 0 ? items[open] : undefined;

  const pick =
    (reel: boolean) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      // Cleared so choosing the same file twice still fires a change event.
      event.target.value = '';
      if (file) onAdd(file, reel);
    };

  const tabs: Array<[string, string, number]> = [
    ['all', COPY.tabAll, counts.all],
    ['photo', COPY.tabPhotos, counts.photo],
    ['video', COPY.tabVideos, counts.video],
    ['reel', COPY.tabReels, counts.reel],
  ];

  return (
    <section className={styles.block} aria-label={COPY.title}>
      <span className={styles.bloom}>
        <CornerBloom petal={PETAL} stem={STEM} size={96} />
      </span>

      <div className={styles.head}>
        <h2 className={styles.heading}>{COPY.title}</h2>
        <span className={styles.tally}>{COPY.tally(counts.all)}</span>
      </div>
      <p className={styles.lead}>{COPY.lead}</p>

      <div className={styles.tabs} role="tablist" aria-label={COPY.tabsLabel}>
        {tabs.map(([id, label, n]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={kind === id}
            className={`${styles.tab} ${kind === id ? styles.tabOn : ''}`}
            onClick={() => onKind(id)}
          >
            {label}
            <span className={styles.tabCount}>{n}</span>
          </button>
        ))}
      </div>

      {/* Only when there is more than one celebration to choose between. */}
      {subEvents.length > 0 && (
        <div className={styles.filters} role="group" aria-label={COPY.filterLabel}>
          <button
            type="button"
            className={`${styles.filter} ${subEvent === 'all' ? styles.filterOn : ''}`}
            onClick={() => onSubEvent('all')}
            aria-pressed={subEvent === 'all'}
          >
            {COPY.allEvents}
          </button>
          {subEvents.map((e) => (
            <button
              key={e.id}
              type="button"
              className={`${styles.filter} ${subEvent === e.id ? styles.filterOn : ''}`}
              onClick={() => onSubEvent(e.id)}
              aria-pressed={subEvent === e.id}
            >
              {e.name}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <p className={styles.empty}>{canUpload ? COPY.emptyCanAdd : COPY.empty}</p>
      ) : (
        <div className={styles.grid}>
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={styles.cell}
              onClick={() => setOpen(index)}
              aria-label={COPY.openItem(index + 1, items.length)}
            >
              <img
                className={styles.thumb}
                src={item.thumbnailUrl}
                alt={item.caption || COPY.photoAlt(index + 1)}
                /* Native lazy loading: a gallery is exactly the case it was
                   added for, and it costs no observer of our own. */
                loading="lazy"
                decoding="async"
              />
              {item.kind !== 'photo' && (
                <>
                  <span className={styles.play}>
                    <Play size={26} fill="currentColor" aria-hidden="true" />
                  </span>
                  {item.kind === 'reel' && (
                    <span className={styles.reelMark}>{COPY.reel}</span>
                  )}
                  {item.durationSec > 0 && (
                    <span className={styles.length}>{clock(item.durationSec)}</span>
                  )}
                </>
              )}
              {/* Said on the tile, because it is only on their own screen. */}
              {item.mine && item.state !== 'published' && (
                <span className={styles.cellNote}>
                  {item.state === 'pending' ? COPY.waiting : COPY.onlyYou}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {nextCursor && (
        <button type="button" className={styles.more} onClick={onMore} disabled={busy}>
          {busy ? COPY.loading : COPY.more}
        </button>
      )}

      {/* Offered only while the hosts are accepting photos and the window is
          open — both decided on the server, both arriving as `canUpload`. */}
      {canUpload && (
        <>
          <div className={styles.addBar}>
            <button
              type="button"
              className={styles.add}
              onClick={() => photoInput.current?.click()}
              disabled={busy}
            >
              <ImagePlus size={16} aria-hidden="true" />
              {busy ? COPY.adding : COPY.add}
            </button>
            <button
              type="button"
              className={styles.addQuiet}
              onClick={() => reelInput.current?.click()}
              disabled={busy}
              aria-label={COPY.addReel}
            >
              <Camera size={16} aria-hidden="true" />
            </button>
          </div>
          <input
            ref={photoInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
            className={styles.fileInput}
            onChange={pick(false)}
          />
          <input
            ref={reelInput}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            /* `capture` asks the phone for its camera rather than its library;
               a desktop browser ignores it and opens the file picker. */
            capture="environment"
            className={styles.fileInput}
            onChange={pick(true)}
          />
        </>
      )}

      {say && (
        <p className={`${styles.say} ${sayWarn ? styles.sayWarn : ''}`} role="status">
          {say}
          {keepId && (
            <button type="button" className={styles.keep} onClick={() => onKeep(keepId)}>
              {COPY.keep}
            </button>
          )}
        </p>
      )}

      <Lightbox open={Boolean(viewing)} onClose={() => setOpen(-1)} label={COPY.close}>
        {viewing && (
          <div className={styles.viewer}>
            {viewing.kind === 'photo' ? (
              /* The display rendition, not the original: a 12-megapixel file
                 is not what a phone screen needs to show one photograph. The
                 original is fetched only by the download button below. */
              <img
                className={styles.viewerMedia}
                src={viewing.displayUrl}
                alt={viewing.caption || COPY.photoAlt(open + 1)}
              />
            ) : (
              /* The file is ours and same-origin-ish, so a plain video element
                 plays it with the browser's own controls — no player needed.
                 `preload="metadata"` so opening the viewer does not pull the
                 whole clip before anyone presses play. */
              <video
                className={styles.viewerMedia}
                src={viewing.url}
                controls
                playsInline
                preload="metadata"
              />
            )}

            <div className={styles.viewerBar}>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => setOpen((i) => Math.max(0, i - 1))}
                disabled={open <= 0}
                aria-label={COPY.previous}
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>

              <span className={styles.viewerCaption}>
                {viewing.caption || COPY.position(open + 1, items.length)}
              </span>

              <button
                type="button"
                className={styles.arrow}
                onClick={() => setOpen((i) => Math.min(items.length - 1, i + 1))}
                disabled={open >= items.length - 1}
                aria-label={COPY.next}
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>

            <div className={styles.viewerBar}>
              <button
                type="button"
                className={`${styles.like} ${viewing.likedByMe ? styles.likeOn : ''}`}
                onClick={() => onLike(viewing.id, !viewing.likedByMe)}
                aria-pressed={viewing.likedByMe}
              >
                <Heart
                  size={15}
                  fill={viewing.likedByMe ? 'currentColor' : 'none'}
                  aria-hidden="true"
                />
                {viewing.likes}
              </button>
              {/* Drawn only when the hosts allowed it — and refused by the
                  server as well, so hiding it is a courtesy not the control. */}
              {canDownload && (
                <button
                  type="button"
                  className={styles.save}
                  onClick={() => onDownload(viewing.id)}
                >
                  <Download size={15} aria-hidden="true" />
                  {COPY.download}
                </button>
              )}
            </div>
          </div>
        )}
      </Lightbox>
    </section>
  );
}

export default MemoriesBlock;
