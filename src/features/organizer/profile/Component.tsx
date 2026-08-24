import { type ChangeEvent, useMemo, useRef } from 'react';
import { Camera, Check, ExternalLink, Plus, X } from 'lucide-react';
import {
  BIO_MAX,
  GALLERY_ACCEPT,
  GALLERY_MAX,
  PROFILE_PHOTO_ACCEPT,
  TAGLINE_MAX,
} from './constants';
import { LivePreview } from './sections';
import type { UseOrganizerProfileResult } from './hooks';
import styles from './styles.module.css';

export type ProfileComponentProps = UseOrganizerProfileResult;

export function Component({
  form,
  errors,
  categoryOptions,
  categoriesLoading,
  preview,
  profilePhoto,
  gallery,
  galleryFull,
  dirty,
  saveState,
  saveError,
  uploading,
  setField,
  toggleCategory,
  uploadPhoto,
  removePhoto,
  addGalleryImage,
  removeGalleryImage,
  save,
}: ProfileComponentProps) {
  const photoInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const categoryLabel = useMemo(() => {
    const map = new Map(categoryOptions.map((o) => [o.key, o.label]));
    return (key: string) => map.get(key) ?? key;
  }, [categoryOptions]);

  const onPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPhoto(file);
    e.target.value = '';
  };

  const onGallery = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) addGalleryImage(file);
    e.target.value = '';
  };

  const saveLabel =
    saveState === 'saving' ? 'Saving…' : saveState === 'saved' && !dirty ? 'Saved' : 'Save profile';

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <LivePreview preview={preview} categoryLabel={categoryLabel} />

        <section className={styles.editor}>
          <div className={styles.header}>
            <h1 className={styles.heading}>Edit your profile</h1>
            <div className={styles.headerActions}>
              {preview?.isLive && (
                <a
                  className={styles.secondaryBtn}
                  href={`/organizer/${preview.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={15} /> Preview as customer
                </a>
              )}
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={save}
                disabled={!dirty || saveState === 'saving'}
              >
                {saveState === 'saved' && !dirty && <Check size={15} />}
                {saveLabel}
              </button>
            </div>
          </div>

          {saveError && (
            <p className={styles.error} role="alert">
              {saveError}
            </p>
          )}

          <div className={styles.card}>
            <div className={styles.identity}>
              <div className={styles.photoCol}>
                <div className={styles.photoFrame}>
                  {profilePhoto ? (
                    <img src={profilePhoto.url} alt="Your profile photo" className={styles.photo} />
                  ) : (
                    <span className={styles.photoEmpty} aria-hidden>
                      <Camera size={22} />
                    </span>
                  )}
                </div>
                <div className={styles.photoActions}>
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() => photoInput.current?.click()}
                    disabled={uploading === 'profilePhoto'}
                  >
                    {uploading === 'profilePhoto'
                      ? 'Uploading…'
                      : profilePhoto
                        ? 'Change photo'
                        : 'Add photo'}
                  </button>
                  {profilePhoto && (
                    <button type="button" className={styles.linkBtnMuted} onClick={removePhoto}>
                      Remove
                    </button>
                  )}
                </div>
                <input
                  ref={photoInput}
                  type="file"
                  accept={PROFILE_PHOTO_ACCEPT}
                  onChange={onPhoto}
                  hidden
                />
              </div>

              <div className={styles.identityFields}>
                <label className={styles.field}>
                  <span className={styles.label}>
                    Business name <span className={styles.req}>*</span>
                  </span>
                  <input
                    className={errors.businessName ? styles.inputError : styles.input}
                    value={form.businessName}
                    onChange={(e) => setField('businessName', e.target.value)}
                    placeholder="e.g. Ravi Events"
                    aria-invalid={Boolean(errors.businessName)}
                  />
                  {errors.businessName && (
                    <span className={styles.fieldError} role="alert">
                      {errors.businessName}
                    </span>
                  )}
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Display name</span>
                  <input
                    className={errors.displayName ? styles.inputError : styles.input}
                    value={form.displayName}
                    onChange={(e) => setField('displayName', e.target.value)}
                    placeholder="What customers see (defaults to your business name)"
                  />
                  {errors.displayName && (
                    <span className={styles.fieldError} role="alert">
                      {errors.displayName}
                    </span>
                  )}
                </label>

                <label className={styles.field}>
                  <span className={styles.labelRow}>
                    <span className={styles.label}>Tagline</span>
                    <span className={styles.counter}>
                      {form.tagline.length}/{TAGLINE_MAX}
                    </span>
                  </span>
                  <input
                    className={errors.tagline ? styles.inputError : styles.input}
                    value={form.tagline}
                    onChange={(e) => setField('tagline', e.target.value.slice(0, TAGLINE_MAX))}
                    placeholder="Capturing your moments, beautifully."
                    maxLength={TAGLINE_MAX}
                  />
                  {errors.tagline && (
                    <span className={styles.fieldError} role="alert">
                      {errors.tagline}
                    </span>
                  )}
                </label>
              </div>
            </div>

            <label className={styles.field}>
              <span className={styles.labelRow}>
                <span className={styles.label}>Bio</span>
                <span className={styles.counter}>
                  {form.businessDescription.length}/{BIO_MAX}
                </span>
              </span>
              <textarea
                className={errors.businessDescription ? styles.textareaError : styles.textarea}
                value={form.businessDescription}
                onChange={(e) => setField('businessDescription', e.target.value.slice(0, BIO_MAX))}
                placeholder="Tell customers about your experience, style, and what makes your events special."
                rows={4}
                maxLength={BIO_MAX}
              />
              {errors.businessDescription && (
                <span className={styles.fieldError} role="alert">
                  {errors.businessDescription}
                </span>
              )}
            </label>

            <div className={styles.field}>
              <span className={styles.label}>Service categories</span>
              {categoriesLoading ? (
                <span className={styles.hint}>Loading categories…</span>
              ) : categoryOptions.length === 0 ? (
                <span className={styles.hint}>No categories are configured yet.</span>
              ) : (
                <div className={styles.chips}>
                  {categoryOptions.map((option) => {
                    const on = form.secondaryCategories.includes(option.key);
                    return (
                      <button
                        type="button"
                        key={option.key}
                        className={on ? styles.chipOn : styles.chip}
                        onClick={() => toggleCategory(option.key)}
                        aria-pressed={on}
                      >
                        {on && <Check size={13} />}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
              <span className={styles.hint}>
                These appear as tags on your public profile and help customers find you.
              </span>
            </div>

            <div className={styles.field}>
              <span className={styles.labelRow}>
                <span className={styles.label}>Portfolio gallery</span>
                <span className={styles.counter}>
                  {gallery.length}/{GALLERY_MAX}
                </span>
              </span>
              <div className={styles.gallery}>
                {gallery.map((image, index) => (
                  <div key={image.key} className={styles.thumb}>
                    <img
                      src={image.url}
                      alt={image.originalName ?? `Portfolio image ${index + 1}`}
                    />
                    <button
                      type="button"
                      className={styles.thumbRemove}
                      onClick={() => removeGalleryImage(index)}
                      aria-label={`Remove portfolio image ${index + 1}`}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
                {!galleryFull && (
                  <button
                    type="button"
                    className={styles.addTile}
                    onClick={() => galleryInput.current?.click()}
                    disabled={uploading === 'gallery'}
                    aria-label="Add a portfolio image"
                  >
                    {uploading === 'gallery' ? '…' : <Plus size={20} />}
                  </button>
                )}
              </div>
              <span className={styles.hint}>
                {galleryFull
                  ? `You have added the maximum of ${GALLERY_MAX} images.`
                  : `Images save as soon as they upload — up to ${GALLERY_MAX} total.`}
              </span>
              <input
                ref={galleryInput}
                type="file"
                accept={GALLERY_ACCEPT}
                onChange={onGallery}
                hidden
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
