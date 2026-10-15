import { type ChangeEvent, useMemo, useRef } from 'react';
import {
  BadgeCheck,
  Briefcase,
  Camera,
  Check,
  ExternalLink,
  FileText,
  Images,
  MapPin,
  Plus,
  Star,
  Tags,
  X,
} from 'lucide-react';
import {
  BIO_MAX,
  GALLERY_ACCEPT,
  GALLERY_MAX,
  PROFILE_PHOTO_ACCEPT,
  TAGLINE_MAX,
} from './constants';
import { AccountSwitch } from '@shared/components';
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
    saveState === 'saving'
      ? 'Saving…'
      : saveState === 'saved' && !dirty
        ? 'Saved'
        : 'Save profile';

  /*
   * How complete the profile is, from what a customer actually looks at. Each
   * missing piece is a nudge with its own words, so the bar says what to do
   * next rather than just a percentage.
   */
  const checks: Array<[boolean, string]> = [
    [Boolean(profilePhoto), 'Add a profile photo'],
    [form.tagline.trim().length > 0, 'Write a one-line tagline'],
    [
      form.businessDescription.trim().length >= 40,
      'Tell customers about yourself in the bio',
    ],
    [form.secondaryCategories.length > 0, 'Pick the services you offer'],
    [gallery.length >= 3, 'Add at least 3 portfolio photos'],
  ];
  const doneCount = checks.filter(([ok]) => ok).length;
  const strength = Math.round((doneCount / checks.length) * 100);
  const nextStep = checks.find(([ok]) => !ok)?.[1];

  const shownName =
    form.displayName.trim() || form.businessName.trim() || 'Your business name';
  const initials =
    shownName
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'EV';

  const saveButton = (
    <button
      type="button"
      className={styles.primaryBtn}
      onClick={save}
      disabled={!dirty || saveState === 'saving'}
    >
      {saveState === 'saved' && !dirty && <Check size={15} />}
      {saveLabel}
    </button>
  );

  /*
   * Top to bottom: who you are (the profile header, edited in place), how
   * complete it is and what to do next, then the details in four short cards —
   * business, about, services, portfolio — and the account last. On a wide
   * screen the customer-facing card sits beside it, updating as you type.
   */
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.editor}>
          <div className={styles.hero}>
            <div className={styles.banner} aria-hidden />
            <div className={styles.heroBody}>
              <div className={styles.avatarWrap}>
                <div className={styles.avatar}>
                  {profilePhoto ? (
                    <img
                      src={profilePhoto.url}
                      alt="Your profile photo"
                      className={styles.photo}
                    />
                  ) : (
                    <span className={styles.avatarInitials}>{initials}</span>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.cameraBtn}
                  onClick={() => photoInput.current?.click()}
                  disabled={uploading === 'profilePhoto'}
                  aria-label={profilePhoto ? 'Change photo' : 'Add photo'}
                >
                  <Camera size={15} />
                </button>
                <input
                  ref={photoInput}
                  type="file"
                  accept={PROFILE_PHOTO_ACCEPT}
                  onChange={onPhoto}
                  hidden
                />
              </div>

              <div className={styles.heroText}>
                <h1 className={styles.heroName}>{shownName}</h1>
                <p
                  className={
                    form.tagline ? styles.heroTagline : styles.heroTaglineEmpty
                  }
                >
                  {form.tagline ||
                    'Add a tagline so customers know what you do at a glance.'}
                </p>
                <div className={styles.heroChips}>
                  {preview?.tier && (
                    <span className={styles.heroChip}>
                      <BadgeCheck size={13} /> {preview.tier}
                    </span>
                  )}
                  <span className={styles.heroChip}>
                    <Star size={13} />{' '}
                    {preview?.rating ? preview.rating.toFixed(1) : 'New'}
                    {preview && preview.reviews > 0
                      ? ` · ${preview.reviews} reviews`
                      : ''}
                  </span>
                  {preview?.city && (
                    <span className={styles.heroChip}>
                      <MapPin size={13} /> {preview.city}
                    </span>
                  )}
                  <span
                    className={
                      preview?.isLive ? styles.liveChip : styles.pendingChip
                    }
                  >
                    {preview?.isLive ? 'Live for customers' : 'Not live yet'}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.heroActions}>
              {uploading === 'profilePhoto' ? (
                <span className={styles.hint}>Uploading photo…</span>
              ) : profilePhoto ? (
                <button
                  type="button"
                  className={styles.linkBtnMuted}
                  onClick={removePhoto}
                >
                  Remove photo
                </button>
              ) : null}
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
              <span className={styles.heroSave}>{saveButton}</span>
            </div>
          </div>

          <div className={styles.strength}>
            <div className={styles.strengthHead}>
              <strong>Profile strength</strong>
              <span>{strength}%</span>
            </div>
            <div className={styles.strengthTrack}>
              <span
                className={styles.strengthFill}
                style={{ width: `${strength}%` }}
              />
            </div>
            <p className={styles.strengthNext}>
              {nextStep
                ? `Next: ${nextStep}.`
                : 'Your profile is complete — customers see it all.'}
            </p>
          </div>

          {saveError && (
            <p className={styles.error} role="alert">
              {saveError}
            </p>
          )}

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <Briefcase size={16} /> Business details
            </h2>
            <label className={styles.field}>
              <span className={styles.label}>
                Business name <span className={styles.req}>*</span>
              </span>
              <input
                className={
                  errors.businessName ? styles.inputError : styles.input
                }
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
                className={
                  errors.displayName ? styles.inputError : styles.input
                }
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
                onChange={(e) =>
                  setField('tagline', e.target.value.slice(0, TAGLINE_MAX))
                }
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

          <div className={styles.card}>
            <label className={styles.field}>
              <span className={styles.labelRow}>
                <span className={styles.cardTitle}>
                  <FileText size={16} /> About you
                </span>
                <span className={styles.counter}>
                  {form.businessDescription.length}/{BIO_MAX}
                </span>
              </span>
              <textarea
                className={
                  errors.businessDescription
                    ? styles.textareaError
                    : styles.textarea
                }
                value={form.businessDescription}
                onChange={(e) =>
                  setField(
                    'businessDescription',
                    e.target.value.slice(0, BIO_MAX),
                  )
                }
                placeholder="Tell customers about your experience, style, and what makes your events special."
                rows={5}
                maxLength={BIO_MAX}
              />
              {errors.businessDescription && (
                <span className={styles.fieldError} role="alert">
                  {errors.businessDescription}
                </span>
              )}
            </label>
          </div>

          <div className={styles.card}>
            <div className={styles.field}>
              <span className={styles.cardTitle}>
                <Tags size={16} /> Services you offer
              </span>
              {categoriesLoading ? (
                <span className={styles.hint}>Loading categories…</span>
              ) : categoryOptions.length === 0 ? (
                <span className={styles.hint}>
                  No categories are configured yet.
                </span>
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
                These appear as tags on your public profile and help customers
                find you.
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.field}>
              <span className={styles.labelRow}>
                <span className={styles.cardTitle}>
                  <Images size={16} /> Portfolio
                </span>
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
                    {uploading === 'gallery' ? '…' : <Plus size={22} />}
                    <span>
                      {uploading === 'gallery' ? 'Uploading' : 'Add photo'}
                    </span>
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

          <AccountSwitch portalLabel="organizer" />
        </section>

        {/* Beside the editor on a wide screen: the card customers see. */}
        <div className={styles.previewRail}>
          <LivePreview preview={preview} categoryLabel={categoryLabel} />
        </div>
      </div>

      {/* A phone: once something changes, Save is under the thumb. */}
      {dirty && <div className={styles.saveBar}>{saveButton}</div>}
    </main>
  );
}
