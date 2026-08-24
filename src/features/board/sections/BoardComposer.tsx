import { useRef, useState } from 'react';
import { Camera, Lock, Plus, X } from 'lucide-react';
import { CUSTOMER_TYPES, ORGANIZER_TYPES, TYPE_META, initials } from '../constants';
import { uploadIdeaImage } from '../upload';
import type { DraftPost, IdeaImage, IdeaType } from '../types';
import styles from '../board.module.css';

export interface BoardComposerProps {
  role: 'customer' | 'organizer';
  /** The composing user's own name, for the avatar. */
  authorName: string;
  /** The other party, named in the placeholder. */
  counterpartName: string;
  isPosting: boolean;
  onPost: (draft: DraftPost) => void;
}

/**
 * Posting to the board.
 *
 * Which types are on offer comes from the role, matching what the API accepts:
 * the customer contributes ideas, inspiration, questions and surprises; the
 * organizer posts updates and questions. Choosing "surprise" marks the post
 * confidential, which is what keeps it out of anything shared onward.
 *
 * Photos are uploaded as they are picked, so a post is only ever submitted with
 * attachments that already exist on the server.
 */
export function BoardComposer({
  role,
  authorName,
  counterpartName,
  isPosting,
  onPost,
}: BoardComposerProps) {
  const isOrg = role === 'organizer';
  const [text, setText] = useState('');
  const [type, setType] = useState<IdeaType>(isOrg ? 'update' : 'idea');
  const [images, setImages] = useState<IdeaImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const types = isOrg ? ORGANIZER_TYPES : CUSTOMER_TYPES;
  const confidential = type === 'surprise';

  const pick = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError('');
    setUploading(true);
    try {
      const added: IdeaImage[] = [];
      for (const file of Array.from(files)) {
        added.push(await uploadIdeaImage(file));
      }
      setImages((prev) => [...prev, ...added]);
    } catch {
      setUploadError('That photo couldn’t be uploaded. Try a JPG, PNG or WebP under 8MB.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = () => {
    const t = text.trim();
    if (!t || isPosting || uploading) return;
    onPost({ text: t, type, confidential, images });
    setText('');
    setImages([]);
    setUploadError('');
  };

  return (
    <section className={styles.composer}>
      <span
        className={`${styles.avatar} ${isOrg ? styles.avatarSquare : ''}`}
        style={{ background: isOrg ? 'var(--color-navy)' : 'var(--color-primary)' }}
        aria-hidden="true"
      >
        {initials(authorName)}
      </span>

      <div className={styles.composerBody}>
        <textarea
          className={styles.input}
          value={text}
          rows={1}
          maxLength={4000}
          placeholder={
            isOrg
              ? 'Post a planning update or reply to an idea…'
              : confidential
                ? 'Something you want planned without it showing up anywhere you share…'
                : `Share how you imagine your day with ${counterpartName}…`
          }
          onChange={(e) => setText(e.target.value)}
        />

        {images.length > 0 && (
          <div className={styles.thumbs}>
            {images.map((img) => (
              <div key={img.url} className={styles.thumb}>
                <img src={img.url} alt={img.originalName || 'Attachment'} />
                <button
                  type="button"
                  className={styles.thumbX}
                  aria-label={`Remove ${img.originalName || 'photo'}`}
                  onClick={() => setImages((prev) => prev.filter((i) => i.url !== img.url))}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.composerFoot}>
          {types.map((value) => {
            const meta = TYPE_META[value];
            const Icon = meta.icon;
            const on = type === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={on}
                className={`${styles.typeBtn} ${styles[meta.cls] ?? ''}`}
                style={on ? undefined : { background: 'var(--color-bg)', color: 'var(--c-muted2)' }}
                onClick={() => setType(value)}
              >
                <Icon size={12} /> {meta.label}
              </button>
            );
          })}

          <div className={styles.composerActions}>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={(e) => void pick(e.target.files)}
            />
            <button
              type="button"
              className={styles.photoBtn}
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Camera size={16} />
              <span className={styles.photoLabel}>{uploading ? 'Uploading…' : 'Photo'}</span>
            </button>
            <button
              type="button"
              className={styles.postBtn}
              onClick={submit}
              disabled={!text.trim() || isPosting || uploading}
            >
              <Plus size={15} />
              {isPosting ? 'Posting…' : isOrg ? 'Post update' : 'Post idea'}
            </button>
          </div>

          {confidential && (
            <span className={styles.secretNote}>
              <Lock size={12} /> Only you and {counterpartName} will see this
            </span>
          )}
          {uploadError && <p className={styles.uploadError}>{uploadError}</p>}
        </div>
      </div>
    </section>
  );
}

export default BoardComposer;
