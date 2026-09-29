import { useState } from 'react';
import { ArrowLeft, Check, Eye, EyeOff, Trash2, X } from 'lucide-react';
import { Button } from '@shared/reusable';
import type { ManagedGallery, ManagedMemory, MemorySettings } from './service';
import styles from './styles.module.css';

type Tab = 'settings' | 'queue' | 'gallery';
export type MemoryAction = 'approve' | 'reject' | 'hide' | 'show';

export interface MemoriesComponentProps {
  eventTitle: string;
  settings: MemorySettings;
  awaiting: ManagedMemory[];
  gallery: ManagedGallery | undefined;
  kind: string;
  subEvent: string;
  busy: boolean;
  error: string;
  onBack: () => void;
  onSetting: (patch: Partial<Omit<MemorySettings, 'window'>>) => void;
  onKind: (kind: string) => void;
  onSubEvent: (id: string) => void;
  onMore: () => void;
  onAct: (mediaId: string, action: MemoryAction) => void;
  onDelete: (mediaId: string) => void;
}

const COPY = {
  title: 'Shared Memories',
  sub: 'What your guests photographed, and who may see it.',
  back: 'Back to the event',
  tabs: { settings: 'Settings', queue: 'Pending Approval', gallery: 'Gallery' },

  featureTitle: 'The gallery',
  featureLead:
    'Switched off, nobody sees the gallery and nothing can be added to it. Everything already shared is kept, and comes back when you switch it on again.',
  permissionsTitle: 'What guests can do',
  windowTitle: 'When guests can add photos',
  windowLead:
    'Read in your event’s own timezone. Uploads close this many days after the last celebration on the invitation.',

  enabled: ['Shared Memories', 'The whole feature, for everyone.'],
  guestView: ['Guest viewing', 'Guests can open the gallery and see what has been shared.'],
  guestUpload: ['Guest uploads', 'Guests can add their own photos, videos and reels.'],
  guestDownload: [
    'Guest downloads',
    'Guests can save a copy of a photo. Off by default — these are your photographs.',
  ],
  moderation: [
    'Moderation',
    'Every upload waits for you before any guest sees it.',
  ],
  on: 'On',
  off: 'Off',
  opensLabel: 'Open uploads from',
  opensAny: 'As soon as it is switched on',
  daysLabel: 'Stay open for',
  days: (n: number) => `${n} ${n === 1 ? 'day' : 'days'} after the event`,
  closed: 'Uploads are closed right now.',
  openNow: 'Uploads are open right now.',

  queueLead: 'Nothing reaches your guests until you approve it.',
  queueEmpty: 'Nothing is waiting for you.',
  queueEmptyOff: 'Moderation is off, so uploads go straight to the gallery.',
  approve: 'Approve',
  reject: 'Reject',
  hide: 'Hide',
  show: 'Show',
  del: 'Delete',
  open: 'Open',

  galleryLead: 'Everything shared, newest first.',
  galleryEmpty: 'No memories have been shared yet.',
  all: 'All',
  photos: 'Photos',
  videos: 'Videos',
  reels: 'Reels',
  allEvents: 'All Events',
  ownEvent: 'The celebration itself',
  more: 'Show more',

  detail: 'Memory',
  by: 'Shared by',
  when: 'Added',
  type: 'Type',
  event: 'Celebration',
  caption: 'Caption',
  status: 'Status',
  likes: 'Likes',
  someone: 'A guest',
  none: '—',
  unclear: 'May not be clear enough',
  tooDark: 'May be too dark to see',
  duplicate: 'Already shared by someone else',
  confirm: 'Delete this memory?',
  confirmNote:
    'The photo and every copy of it are removed for good. This cannot be undone.',
  cancel: 'Cancel',
};

/** The plain sentence for a flag. Never the measurement behind it. */
function flagWords(flags: string[]): string {
  if (flags.includes('duplicate')) return COPY.duplicate;
  if (flags.includes('blurry')) return COPY.unclear;
  if (flags.includes('dark')) return COPY.tooDark;
  return '';
}

/** What this item's state means, in words the owner reads. */
function stateWords(item: ManagedMemory): string {
  if (item.moderationStatus === 'awaiting') return 'Waiting for you';
  if (item.moderationStatus === 'rejected') return 'Rejected';
  if (item.status === 'hidden') return 'Hidden from guests';
  if (item.visibility === 'uploader') return 'Only its uploader can see it';
  return 'In the gallery';
}

const when = (iso: string) =>
  iso
    ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    : COPY.none;

/**
 * One setting: what it does, and whether it is on.
 *
 * Defined here rather than inside the screen — a component declared during
 * render is a new type every time, so React remounts it and the checkbox loses
 * focus the moment it is used.
 */
function Switch({
  name,
  note,
  value,
  busy,
  disabled,
  onChange,
}: {
  name: string;
  note: string;
  value: boolean;
  busy: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className={`${styles.row} ${disabled ? styles.rowOff : ''}`}>
      <span className={styles.rowText}>
        <span className={styles.rowName}>{name}</span>
        <span className={styles.rowNote}>{note}</span>
      </span>
      <label className={styles.switch}>
        <input
          type="checkbox"
          className={styles.switchInput}
          checked={value}
          disabled={disabled || busy}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className={styles.track} aria-hidden="true">
          <span className={styles.knob} />
        </span>
        {/* Said in words, not only by the position of a knob. */}
        <span className={styles.switchWord}>{value ? COPY.on : COPY.off}</span>
      </label>
    </div>
  );
}

/**
 * The customer's Shared Memories screen.
 *
 * Three tabs and nothing else: what the feature does, what is waiting, and
 * what is there. Deliberately not an admin console — the person using this is
 * looking after their own wedding photographs, and the workspace they reach it
 * from is the one they approve their invitation in.
 */
export function MemoriesComponent({
  eventTitle,
  settings,
  awaiting,
  gallery,
  kind,
  subEvent,
  busy,
  error,
  onBack,
  onSetting,
  onKind,
  onSubEvent,
  onMore,
  onAct,
  onDelete,
}: MemoriesComponentProps) {
  const [tab, setTab] = useState<Tab>('settings');
  const [openItem, setOpenItem] = useState<ManagedMemory | null>(null);
  const [confirming, setConfirming] = useState(false);

  const nameOf = (id: string) =>
    id ? (gallery?.subEvents.find((e) => e.id === id)?.name ?? COPY.none) : COPY.ownEvent;

  /* Every guest-facing permission is meaningless while the feature is off, so
     they are shown disabled rather than hidden — the customer can see what
     switching it back on would restore. */
  const off = !settings.enabled;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>{COPY.title}</h1>
            <p className={styles.heroSub}>
              {eventTitle} · {COPY.sub}
            </p>
          </div>
          <button type="button" className={styles.back} onClick={onBack}>
            <ArrowLeft size={14} /> {COPY.back}
          </button>
        </header>

        <nav className={styles.tabs}>
          {(['settings', 'queue', 'gallery'] as Tab[]).map((id) => (
            <button
              key={id}
              type="button"
              className={`${styles.tab} ${tab === id ? styles.tabOn : ''}`}
              onClick={() => setTab(id)}
              aria-current={tab === id}
            >
              {COPY.tabs[id]}
              {id === 'queue' && awaiting.length > 0 && (
                <span className={styles.badge}>{awaiting.length}</span>
              )}
            </button>
          ))}
        </nav>

        {error && <p className={styles.error}>{error}</p>}

        {/* ------------------------------------------------------ settings */}
        {tab === 'settings' && (
          <>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>{COPY.featureTitle}</h2>
              <p className={styles.cardLead}>{COPY.featureLead}</p>
              <div className={styles.rows}>
                <Switch
                  name={COPY.enabled[0]!}
                  note={COPY.enabled[1]!}
                  value={settings.enabled}
                  busy={busy}
                  onChange={(enabled) => onSetting({ enabled })}
                />
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>{COPY.permissionsTitle}</h2>
              <div className={styles.rows}>
                <Switch
                  name={COPY.guestView[0]!}
                  note={COPY.guestView[1]!}
                  value={settings.guestView}
                  busy={busy}
                  onChange={(guestView) => onSetting({ guestView })}
                  disabled={off}
                />
                <Switch
                  name={COPY.guestUpload[0]!}
                  note={COPY.guestUpload[1]!}
                  value={settings.guestUpload}
                  busy={busy}
                  onChange={(guestUpload) => onSetting({ guestUpload })}
                  disabled={off}
                />
                <Switch
                  name={COPY.guestDownload[0]!}
                  note={COPY.guestDownload[1]!}
                  value={settings.guestDownload}
                  busy={busy}
                  onChange={(guestDownload) => onSetting({ guestDownload })}
                  disabled={off}
                />
                <Switch
                  name={COPY.moderation[0]!}
                  note={COPY.moderation[1]!}
                  value={settings.moderation}
                  busy={busy}
                  onChange={(moderation) => onSetting({ moderation })}
                  disabled={off}
                />
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>{COPY.windowTitle}</h2>
              <p className={styles.cardLead}>{COPY.windowLead}</p>
              <div className={styles.window}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>{COPY.opensLabel}</span>
                  <input
                    type="date"
                    value={settings.uploadFrom}
                    disabled={off || busy}
                    onChange={(e) => onSetting({ uploadFrom: e.target.value })}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>{COPY.daysLabel}</span>
                  <select
                    value={String(settings.uploadWindowDays)}
                    disabled={off || busy}
                    onChange={(e) => onSetting({ uploadWindowDays: Number(e.target.value) })}
                  >
                    {[0, 1, 3, 7, 14, 30, 90].map((n) => (
                      <option key={n} value={n}>
                        {n === 0 ? 'During the event only' : COPY.days(n)}
                      </option>
                    ))}
                  </select>
                </label>
                <p className={styles.windowNote}>
                  {!settings.uploadFrom && `${COPY.opensAny}. `}
                  {settings.window.open ? COPY.openNow : settings.window.reason || COPY.closed}
                </p>
              </div>
            </section>
          </>
        )}

        {/* --------------------------------------------------------- queue */}
        {tab === 'queue' && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>{COPY.tabs.queue}</h2>
            <p className={styles.cardLead}>{COPY.queueLead}</p>
            {awaiting.length === 0 ? (
              <p className={styles.empty}>
                {settings.moderation ? COPY.queueEmpty : COPY.queueEmptyOff}
              </p>
            ) : (
              <div className={styles.queue}>
                {awaiting.map((item) => (
                  <div key={item.id} className={styles.queueRow}>
                    <img
                      className={styles.queueThumb}
                      src={item.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      onClick={() => setOpenItem(item)}
                    />
                    <span className={styles.queueText}>
                      <span className={styles.queueTitle}>
                        {item.caption || COPY.detail}
                      </span>
                      <span className={styles.queueMeta}>
                        {item.kind} · {nameOf(item.subEvent)} ·{' '}
                        {item.uploader || COPY.someone} · {when(item.createdAt)}
                        {flagWords(item.flags) && ` · ${flagWords(item.flags)}`}
                      </span>
                    </span>
                    {/* The two decisions, right on the row — the whole point of
                        a queue is not having to open each one. */}
                    <span className={styles.queueActions}>
                      <Button
                        size="sm"
                        variant="brand"
                        disabled={busy}
                        onClick={() => onAct(item.id, 'approve')}
                      >
                        <Check size={14} /> {COPY.approve}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onClick={() => onAct(item.id, 'reject')}
                      >
                        <X size={14} /> {COPY.reject}
                      </Button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ------------------------------------------------------- gallery */}
        {tab === 'gallery' && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>{COPY.tabs.gallery}</h2>
            <p className={styles.cardLead}>{COPY.galleryLead}</p>

            <div className={styles.filters}>
              {(
                [
                  ['all', COPY.all],
                  ['photo', COPY.photos],
                  ['video', COPY.videos],
                  ['reel', COPY.reels],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.chip} ${kind === id ? styles.chipOn : ''}`}
                  onClick={() => onKind(id)}
                >
                  {label}
                  {gallery ? ` ${gallery.counts[id as keyof typeof gallery.counts]}` : ''}
                </button>
              ))}
            </div>

            {/* The celebrations come from the invitation, never a fixed list. */}
            {gallery && gallery.subEvents.length > 0 && (
              <div className={styles.filters}>
                <button
                  type="button"
                  className={`${styles.chip} ${subEvent === 'all' ? styles.chipOn : ''}`}
                  onClick={() => onSubEvent('all')}
                >
                  {COPY.allEvents}
                </button>
                {gallery.subEvents.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    className={`${styles.chip} ${subEvent === e.id ? styles.chipOn : ''}`}
                    onClick={() => onSubEvent(e.id)}
                  >
                    {e.name}
                  </button>
                ))}
              </div>
            )}

            {!gallery || gallery.items.length === 0 ? (
              <p className={styles.empty}>{COPY.galleryEmpty}</p>
            ) : (
              <>
                <div className={styles.grid}>
                  {gallery.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={styles.cell}
                      onClick={() => setOpenItem(item)}
                    >
                      <img
                        className={styles.cellImg}
                        src={item.thumbnailUrl}
                        alt={item.caption || ''}
                        loading="lazy"
                        decoding="async"
                      />
                      {item.kind !== 'photo' && (
                        <span className={styles.cellTag}>{item.kind.toUpperCase()}</span>
                      )}
                      {stateWords(item) !== 'In the gallery' && (
                        <span className={styles.cellState}>{stateWords(item)}</span>
                      )}
                    </button>
                  ))}
                </div>
                {gallery.nextCursor && (
                  <div className={styles.more}>
                    <Button variant="secondary" disabled={busy} onClick={onMore}>
                      {COPY.more}
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>

      {/* --------------------------------------------------------- details */}
      {openItem && (
        <div
          className={styles.backdrop}
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenItem(null);
              setConfirming(false);
            }
          }}
        >
          <div className={styles.dialog} role="dialog" aria-modal="true">
            <div className={styles.dialogHead}>
              <h2 className={styles.dialogTitle}>{openItem.caption || COPY.detail}</h2>
              <button
                type="button"
                className={styles.close}
                onClick={() => {
                  setOpenItem(null);
                  setConfirming(false);
                }}
                aria-label={COPY.cancel}
              >
                <X size={18} />
              </button>
            </div>

            {/* The display rendition, never the original — the same rule the
                guest viewer follows. */}
            {openItem.kind === 'photo' ? (
              <img className={styles.preview} src={openItem.displayUrl} alt="" />
            ) : (
              <video className={styles.preview} src={openItem.url} controls preload="metadata" />
            )}

            {flagWords(openItem.flags) && (
              <p className={styles.warn}>{flagWords(openItem.flags)}</p>
            )}

            <dl className={styles.facts}>
              {[
                [COPY.type, openItem.kind],
                [COPY.event, nameOf(openItem.subEvent)],
                [COPY.by, openItem.uploader || COPY.someone],
                [COPY.when, when(openItem.createdAt)],
                [COPY.status, stateWords(openItem)],
                [COPY.likes, String(openItem.likes)],
                [COPY.caption, openItem.caption || COPY.none],
              ].map(([key, value]) => (
                <div key={key} className={styles.fact}>
                  <dt className={styles.factKey}>{key}</dt>
                  <dd className={styles.factValue}>{value}</dd>
                </div>
              ))}
            </dl>

            {confirming ? (
              <>
                <p className={styles.confirm}>
                  <strong>{COPY.confirm}</strong> {COPY.confirmNote}
                </p>
                <div className={styles.dialogActions}>
                  <Button variant="secondary" onClick={() => setConfirming(false)}>
                    {COPY.cancel}
                  </Button>
                  <Button
                    variant="primary"
                    className={styles.danger}
                    disabled={busy}
                    onClick={() => {
                      onDelete(openItem.id);
                      setOpenItem(null);
                      setConfirming(false);
                    }}
                  >
                    <Trash2 size={14} /> {COPY.del}
                  </Button>
                </div>
              </>
            ) : (
              <div className={styles.dialogActions}>
                {openItem.moderationStatus === 'awaiting' && (
                  <>
                    <Button
                      variant="brand"
                      disabled={busy}
                      onClick={() => onAct(openItem.id, 'approve')}
                    >
                      <Check size={14} /> {COPY.approve}
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={busy}
                      onClick={() => onAct(openItem.id, 'reject')}
                    >
                      <X size={14} /> {COPY.reject}
                    </Button>
                  </>
                )}
                {openItem.status === 'hidden' ? (
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => onAct(openItem.id, 'show')}
                  >
                    <Eye size={14} /> {COPY.show}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => onAct(openItem.id, 'hide')}
                  >
                    <EyeOff size={14} /> {COPY.hide}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  className={styles.danger}
                  disabled={busy}
                  onClick={() => setConfirming(true)}
                >
                  <Trash2 size={14} /> {COPY.del}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default MemoriesComponent;
