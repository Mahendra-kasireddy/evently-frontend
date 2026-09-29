import { useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  Clock,
  Image as ImageIcon,
  Maximize2,
  MessageSquare,
  Trash2,
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

  return (
    <PageStack>
      <div className={styles.main}>
        <div className={styles.head}>
          <div className={styles.headText}>
            <h2 className={styles.heading}>{COPY.heading}</h2>
            <p className={styles.sub}>
              {invitation.bookingTitle} ·{' '}
              {formatEventDate(invitation.eventDate)} · ID{' '}
              {invitation.bookingRef}
            </p>
          </div>
          <Btn
            kind="primary"
            sm
            icon={<ArrowRight size={14} />}
            onClick={() => void send()}
            disabled={busy || !artwork}
          >
            {sent ? COPY.resend : COPY.send}
          </Btn>
        </div>

        <div
          className={`${styles.statusBar} ${approved ? styles.statusOk : styles.statusWait}`}
        >
          {approved ? <Check size={18} /> : <Clock size={18} />}
          <span className={styles.statusText}>{STATUS_COPY[status]}</span>
          {status === 'sent' && (
            <span className={styles.statusHint}>{COPY.awaitingHint}</span>
          )}
        </div>

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

        <section className={styles.artwork}>
          <h3 className={styles.artworkTitle}>{COPY.artworkTitle}</h3>
          <p className={styles.artworkLead}>{COPY.artworkLead}</p>

          {artwork ? (
            /*
             * Small on the page, full size on click.
             *
             * The invitation is portrait and tall; at full width it pushed
             * everything that acts on it — upload, replace, send — below the
             * fold. A thumbnail says which invitation this is, and opening it
             * is one click away when the organizer wants to actually read it.
             */
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
            <div className={styles.canvasEmpty}>
              <strong>{COPY.artworkEmptyTitle}</strong>
              <span>{COPY.artworkEmptyBody}</span>
            </div>
          )}

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
                kind="outline"
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

          {uploadError && <p className={styles.artworkError}>{uploadError}</p>}

          <p className={styles.artworkNote}>
            {!artwork
              ? COPY.sendNeedsArtwork
              : sent
                ? COPY.resendNote
                : COPY.sendNote}
          </p>
        </section>

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

        {/*
         * Above the countdown, because the countdown points at one of these.
         * An organizer picking a target reads the list of events they have
         * just been arranging, in the order they arranged them.
         */}
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

        {/*
         * Shared memories, last: it fills up after the invitation has gone
         * out. Read and add only — the gallery is the customer's.
         */}
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

        <CountdownEditor
          subEvents={invitation.subEvents}
          settings={countdown}
          isSaving={isSaving}
          dirty={countdownDirty}
          error={countdownError}
          onChange={setCountdown}
          onSave={() => void saveCountdown()}
        />
      </div>

      {/* The invitation, as the customer and their guests get it. */}
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
