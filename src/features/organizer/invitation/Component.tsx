import { useRef, useState } from 'react';
import {
  ArrowRight,
  CalendarHeart,
  Check,
  Image as ImageIcon,
  ImagePlus,
  Maximize2,
  MessageSquare,
  Images,
  Timer,
  Trash2,
  Upload,
  Video,
} from 'lucide-react';
import { Btn, PageStack, formatEventDate } from '@shared/partner';
import {
  artworkOf,
  InvitationArtworkView,
  Lightbox,
} from '@features/invitation';
import { INVITATION_COPY as COPY, STATUS_COPY } from './constants';
import { IMAGE_TYPES, VIDEO_TYPES } from './artwork';
import { CountdownEditor } from './sections/CountdownEditor';
import { MemoriesPanel } from './sections/MemoriesPanel';
import { SaveTheDateEditor } from './sections/SaveTheDateEditor';
import { StoryEditor } from './sections/StoryEditor';
import type { UseInvitationResult } from './hooks';
import type { OrganizerInvitation } from './types';
import styles from './styles.module.css';

export interface InvitationComponentProps extends Omit<
  UseInvitationResult,
  'invitation'
> {
  invitation: OrganizerInvitation;
}

/**
 * The organizer's half of the invitation.
 *
 * An invitation is a design, and designs are not built out of form fields —
 * every one of them is different, and a builder that tried to cover them would
 * either constrain the design or never finish. So the organizer makes it in
 * whatever they already design in and uploads the finished image or video; the
 * platform's job is to store it, get it approved, and get it to the guests.
 */
export function Component({
  invitation,
  isSaving,
  isUploading,
  uploadError,
  uploadArtwork,
  removeArtwork,
  send,
  resolveRequest,
  storyCards,
  storyTitle,
  isStoryUploading,
  storyError,
  storyDirty,
  setStoryTitle,
  addStoryCard,
  setStoryCaption,
  replaceStoryPhoto,
  removeStoryCard,
  moveStoryCard,
  saveStory,
  subEvents,
  subEventsDirty,
  subEventsError,
  openSubEvent,
  setOpenSubEvent,
  setSubEvents,
  saveSubEvents,
  memories,
  memoryKind,
  memorySubEvent,
  memoryBusy,
  memorySay,
  memorySayWarn,
  setMemoryKind,
  setMemorySubEvent,
  addMemory,
  countdown,
  countdownDirty,
  countdownError,
  setCountdown,
  saveCountdown,
}: InvitationComponentProps) {
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [viewing, setViewing] = useState(false);
  /*
   * The four things built around the invitation, one at a time. Stacked, they
   * made a page five screens long with the invitation itself at the top and
   * nothing to say where the rest was.
   */
  const [tab, setTab] = useState<'story' | 'dates' | 'countdown' | 'memories'>(
    'story',
  );

  const { status } = invitation;
  const sent = status !== 'draft';
  const approved = status === 'approved';
  const artwork = artworkOf(invitation.details);
  const busy = isSaving || isUploading;

  const pick =
    (kind: 'image' | 'video') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      // Cleared so choosing the same file twice still fires a change event.
      event.target.value = '';
      if (file) void uploadArtwork(file, kind);
    };

  /* Where the invitation is in its life: made, sent, approved. */
  const steps: Array<{ label: string; done: boolean }> = [
    { label: 'Uploaded', done: Boolean(artwork) },
    { label: 'Sent to customer', done: sent },
    { label: 'Approved · link live', done: approved },
  ];
  const sendLabel = sent ? COPY.resend : COPY.send;

  const tabs: Array<{
    id: typeof tab;
    label: string;
    icon: React.ReactNode;
    dirty?: boolean;
  }> = [
    {
      id: 'story',
      label: 'Story',
      icon: <Images size={15} />,
      dirty: storyDirty,
    },
    {
      id: 'dates',
      label: 'Save the date',
      icon: <CalendarHeart size={15} />,
      dirty: subEventsDirty,
    },
    {
      id: 'countdown',
      label: 'Countdown',
      icon: <Timer size={15} />,
      dirty: countdownDirty,
    },
    { id: 'memories', label: 'Memories', icon: <ImagePlus size={15} /> },
  ];

  /*
   * Top to bottom: the invitation itself and where it stands (the focus of the
   * screen), anything the customer has asked to change, then the pieces built
   * around it — one tab at a time.
   */
  return (
    <PageStack className={styles.page ?? ''}>
      <div className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroMedia}>
            {artwork ? (
              <button
                type="button"
                className={styles.thumbBtn}
                onClick={() => setViewing(true)}
                aria-label={COPY.artworkOpen}
              >
                <InvitationArtworkView
                  artwork={artwork}
                  label={COPY.artworkImageLabel}
                  className={styles.thumb}
                />
                <span className={styles.thumbHint}>
                  <Maximize2 size={13} /> {COPY.artworkOpen}
                </span>
              </button>
            ) : (
              <button
                type="button"
                className={styles.uploadTile}
                onClick={() => imageInput.current?.click()}
                disabled={busy}
              >
                <Upload size={22} />
                <strong>{COPY.artworkEmptyTitle}</strong>
                <span>{COPY.artworkEmptyBody}</span>
              </button>
            )}
          </div>

          <div className={styles.heroBody}>
            <p className={styles.heroEyebrow}>{COPY.artworkTitle}</p>
            <h2 className={styles.heroTitle}>{invitation.bookingTitle}</h2>
            <p className={styles.sub}>
              {formatEventDate(invitation.eventDate)} · ID{' '}
              {invitation.bookingRef}
            </p>

            <ol className={styles.steps} aria-label="Invitation progress">
              {steps.map((step, i) => (
                <li
                  key={step.label}
                  className={`${styles.step} ${step.done ? styles.stepDone : ''}`}
                >
                  <span className={styles.stepDot}>
                    {step.done ? <Check size={12} /> : i + 1}
                  </span>
                  <span className={styles.stepLabel}>{step.label}</span>
                </li>
              ))}
            </ol>
            <p className={styles.heroStatus}>
              {STATUS_COPY[status]}
              {status === 'sent' ? `. ${COPY.awaitingHint}` : ''}
            </p>

            <div className={styles.artworkBar}>
              <Btn
                kind="outline"
                sm
                icon={<ImageIcon size={14} />}
                onClick={() => imageInput.current?.click()}
                disabled={busy}
              >
                {artwork?.kind === 'image'
                  ? COPY.artworkReplace
                  : COPY.artworkImage}
              </Btn>
              <Btn
                kind="outline"
                sm
                icon={<Video size={14} />}
                onClick={() => videoInput.current?.click()}
                disabled={busy}
              >
                {artwork?.kind === 'video'
                  ? COPY.artworkReplace
                  : COPY.artworkVideo}
              </Btn>
              {artwork && (
                <Btn
                  kind="ghost"
                  sm
                  icon={<Trash2 size={14} />}
                  onClick={() => void removeArtwork()}
                  disabled={busy}
                >
                  {COPY.artworkRemove}
                </Btn>
              )}
              <span className={styles.artworkState}>
                {isUploading
                  ? COPY.artworkUploading
                  : artwork?.kind === 'video'
                    ? COPY.artworkVideoLength(artwork.seconds)
                    : ''}
              </span>
            </div>

            {uploadError && (
              <p className={styles.artworkError}>{uploadError}</p>
            )}

            <div className={styles.heroSend}>
              <Btn
                kind="primary"
                icon={<ArrowRight size={15} />}
                onClick={() => void send()}
                disabled={busy || !artwork}
              >
                {sendLabel}
              </Btn>
              <p className={styles.artworkNote}>
                {!artwork
                  ? COPY.sendNeedsArtwork
                  : sent
                    ? COPY.resendNote
                    : COPY.sendNote}
              </p>
            </div>
          </div>

          {/* The file inputs themselves are never shown — the buttons are the
              control, and a bare "Choose file" is not one. */}
          <input
            ref={imageInput}
            type="file"
            accept={IMAGE_TYPES}
            className={styles.fileInput}
            onChange={pick('image')}
          />
          <input
            ref={videoInput}
            type="file"
            accept={VIDEO_TYPES}
            className={styles.fileInput}
            onChange={pick('video')}
          />
        </section>

        {/*
         * What the customer has asked for. Shown here rather than only as a
         * notification, so an ask cannot be lost by dismissing a bell.
         */}
        {invitation.changeRequests.length > 0 && (
          <section className={styles.asks}>
            <h3 className={styles.asksTitle}>
              <MessageSquare size={16} /> {COPY.asksTitle}
            </h3>
            <ul className={styles.askList}>
              {invitation.changeRequests.map((r) => (
                <li key={r.id} className={styles.ask}>
                  <div className={styles.askText}>
                    <strong>{r.blockTitle || COPY.asksWhole}</strong>
                    <p>{r.note}</p>
                  </div>
                  <Btn
                    kind="outline"
                    sm
                    icon={<Check size={13} />}
                    onClick={() => void resolveRequest(r.id)}
                    disabled={busy}
                  >
                    {COPY.asksResolve}
                  </Btn>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className={styles.builder}>
          <h3 className={styles.builderTitle}>Around the invitation</h3>
          <div
            className={styles.sectionTabs}
            role="tablist"
            aria-label="Invitation sections"
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`${styles.sectionTab} ${tab === t.id ? styles.sectionTabOn : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.icon}
                {t.label}
                {t.dirty && (
                  <span
                    className={styles.dirtyDot}
                    aria-label="Unsaved changes"
                  />
                )}
              </button>
            ))}
          </div>

          <div className={styles.tabPanel} role="tabpanel">
            {tab === 'story' && (
              <StoryEditor
                cards={storyCards}
                title={storyTitle}
                isUploading={isStoryUploading}
                isSaving={isSaving}
                dirty={storyDirty}
                error={storyError}
                onTitle={setStoryTitle}
                onAdd={(file) => void addStoryCard(file)}
                onCaption={setStoryCaption}
                onReplace={(id, file) => void replaceStoryPhoto(id, file)}
                onRemove={removeStoryCard}
                onMove={moveStoryCard}
                onSave={() => void saveStory()}
              />
            )}

            {tab === 'dates' && (
              <SaveTheDateEditor
                cards={subEvents}
                palette={invitation.cardPalette}
                fallbackTimezone={invitation.details.timezone}
                openIndex={openSubEvent}
                isSaving={isSaving}
                dirty={subEventsDirty}
                error={subEventsError}
                onOpenChange={setOpenSubEvent}
                onChange={setSubEvents}
                onSave={() => void saveSubEvents()}
              />
            )}

            {tab === 'countdown' && (
              <CountdownEditor
                subEvents={invitation.subEvents}
                settings={countdown}
                isSaving={isSaving}
                dirty={countdownDirty}
                error={countdownError}
                onChange={setCountdown}
                onSave={() => void saveCountdown()}
              />
            )}

            {/* Read and add only — the gallery is the customer's. */}
            {tab === 'memories' && (
              <MemoriesPanel
                gallery={memories}
                kind={memoryKind}
                subEvent={memorySubEvent}
                busy={memoryBusy}
                say={memorySay}
                sayWarn={memorySayWarn}
                onKind={setMemoryKind}
                onSubEvent={setMemorySubEvent}
                onAdd={(file) => void addMemory(file)}
              />
            )}
          </div>
        </div>
      </div>

      {/* A phone: where it stands and the send button, under the thumb. */}
      <div className={styles.mobileBar}>
        <span className={styles.mobileStatus}>
          <span
            className={`${styles.mobileDot} ${approved ? styles.mobileDotOk : ''}`}
          />
          {approved
            ? 'Approved · link live'
            : sent
              ? 'Waiting for approval'
              : 'Not sent yet'}
        </span>
        <Btn
          kind="primary"
          icon={<ArrowRight size={15} />}
          onClick={() => void send()}
          disabled={busy || !artwork}
        >
          {sendLabel}
        </Btn>
      </div>

      {/* One viewer for every picture the invitation shows full size. */}
      <Lightbox
        open={viewing}
        onClose={() => setViewing(false)}
        label={COPY.artworkClose}
      >
        {artwork && (
          <InvitationArtworkView
            artwork={artwork}
            label={COPY.artworkImageLabel}
            className={styles.lightboxMedia}
          />
        )}
      </Lightbox>
    </PageStack>
  );
}

export default Component;
