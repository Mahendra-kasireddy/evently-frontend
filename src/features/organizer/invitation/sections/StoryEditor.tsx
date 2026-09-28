import { useRef } from 'react';
import { ChevronDown, ChevronUp, ImagePlus, Trash2 } from 'lucide-react';
import { Btn } from '@shared/partner';
import { STORY_CAPTION_MAX, STORY_MAX_CARDS, IMAGE_TYPES } from '../artwork';
import { INVITATION_COPY as COPY } from '../constants';
import type { InvitationStoryCard } from '../types';
import styles from '../styles.module.css';

export interface StoryEditorProps {
  cards: InvitationStoryCard[];
  title: string;
  isUploading: boolean;
  isSaving: boolean;
  dirty: boolean;
  error: string;
  onTitle: (title: string) => void;
  onAdd: (file: File) => void;
  onCaption: (id: string, caption: string) => void;
  onReplace: (id: string, file: File) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, to: number) => void;
  onSave: () => void;
}

/** One card: the photograph, its caption, and where it sits in the story. */
function StoryCardRow({
  card,
  index,
  count,
  disabled,
  onCaption,
  onReplace,
  onRemove,
  onMove,
}: {
  card: InvitationStoryCard;
  index: number;
  count: number;
  disabled: boolean;
  onCaption: (id: string, caption: string) => void;
  onReplace: (id: string, file: File) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, to: number) => void;
}) {
  const replaceInput = useRef<HTMLInputElement>(null);
  const length = card.caption.trim().length;
  const over = length > STORY_CAPTION_MAX;

  return (
    <li className={styles.storyRow}>
      {/*
       * Buttons rather than a drag handle. Dragging is a mouse idiom; the
       * organizer is as likely to be arranging this on a phone, where two
       * arrows are the interaction that actually works — and they are
       * keyboard-operable for free.
       */}
      <div className={styles.storyMove}>
        <button
          type="button"
          className={styles.storyMoveBtn}
          onClick={() => onMove(card.id, index - 1)}
          disabled={disabled || index === 0}
          aria-label={`Move card ${index + 1} earlier`}
        >
          <ChevronUp size={15} />
        </button>
        <span className={styles.storyIndex} aria-hidden="true">
          {index + 1}
        </span>
        <button
          type="button"
          className={styles.storyMoveBtn}
          onClick={() => onMove(card.id, index + 1)}
          disabled={disabled || index === count - 1}
          aria-label={`Move card ${index + 1} later`}
        >
          <ChevronDown size={15} />
        </button>
      </div>

      <button
        type="button"
        className={styles.storyThumbBtn}
        onClick={() => replaceInput.current?.click()}
        disabled={disabled}
        aria-label={`Replace the photo on card ${index + 1}`}
      >
        <img
          className={styles.storyThumb}
          src={card.imageUrl}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden';
          }}
        />
      </button>
      <input
        ref={replaceInput}
        type="file"
        accept={IMAGE_TYPES}
        className={styles.fileInput}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) onReplace(card.id, file);
        }}
      />

      <div className={styles.storyText}>
        <label className={styles.storyLabel} htmlFor={`caption-${card.id}`}>
          {COPY.storyCaption}
        </label>
        <textarea
          id={`caption-${card.id}`}
          className={`${styles.storyCaption} ${over ? styles.storyCaptionOver : ''}`}
          value={card.caption}
          onChange={(e) => onCaption(card.id, e.target.value)}
          placeholder={COPY.storyCaptionHint}
          rows={2}
          disabled={disabled}
        />
        <span
          className={`${styles.storyCount} ${over ? styles.storyCountOver : ''}`}
        >
          {length} / {STORY_CAPTION_MAX}
        </span>
      </div>

      <button
        type="button"
        className={styles.storyDelete}
        onClick={() => onRemove(card.id)}
        disabled={disabled}
        aria-label={`Delete card ${index + 1}`}
      >
        <Trash2 size={15} />
      </button>
    </li>
  );
}

/**
 * The story, as the organizer arranges it.
 *
 * Photographs upload as they are chosen, so a card is only ever added with an
 * image that already exists on the server; everything else — captions, order,
 * the section's title — is arranged here and written in one save, because
 * moving two cards and fixing a line should not be three round trips.
 */
export function StoryEditor({
  cards,
  title,
  isUploading,
  isSaving,
  dirty,
  error,
  onTitle,
  onAdd,
  onCaption,
  onReplace,
  onRemove,
  onMove,
  onSave,
}: StoryEditorProps) {
  const addInput = useRef<HTMLInputElement>(null);
  const busy = isUploading || isSaving;
  const full = cards.length >= STORY_MAX_CARDS;

  return (
    <section className={styles.story}>
      <div className={styles.storyHead}>
        <h3 className={styles.artworkTitle}>{COPY.storyTitle}</h3>
        <span className={styles.storyTally}>
          {cards.length} / {STORY_MAX_CARDS}
        </span>
      </div>
      <p className={styles.artworkLead}>{COPY.storyLead}</p>

      <label className={styles.storyLabel} htmlFor="story-title">
        {COPY.storyTitleField}
      </label>
      <input
        id="story-title"
        className={styles.storyTitleInput}
        value={title}
        onChange={(e) => onTitle(e.target.value)}
        placeholder={COPY.storyTitlePlaceholder}
        maxLength={60}
        disabled={busy}
      />

      {cards.length > 0 && (
        <ul className={styles.storyList}>
          {cards.map((card, index) => (
            <StoryCardRow
              key={card.id}
              card={card}
              index={index}
              count={cards.length}
              disabled={busy}
              onCaption={onCaption}
              onReplace={onReplace}
              onRemove={onRemove}
              onMove={onMove}
            />
          ))}
        </ul>
      )}

      <div className={styles.storyBar}>
        <Btn
          kind="outline"
          sm
          icon={<ImagePlus size={14} />}
          onClick={() => addInput.current?.click()}
          disabled={busy || full}
        >
          {COPY.storyAdd}
        </Btn>
        <Btn kind="primary" sm onClick={onSave} disabled={busy || !dirty}>
          {isSaving ? COPY.storySaving : COPY.storySave}
        </Btn>
        <span className={styles.artworkState}>
          {isUploading ? COPY.storyUploading : full ? COPY.storyFull : ''}
        </span>
      </div>

      <input
        ref={addInput}
        type="file"
        accept={IMAGE_TYPES}
        className={styles.fileInput}
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Cleared so choosing the same file twice still fires a change event.
          e.target.value = '';
          if (file) onAdd(file);
        }}
      />

      {error && <p className={styles.artworkError}>{error}</p>}
      {cards.length === 0 && !error && (
        <p className={styles.artworkNote}>{COPY.storyEmpty}</p>
      )}
    </section>
  );
}

export default StoryEditor;
