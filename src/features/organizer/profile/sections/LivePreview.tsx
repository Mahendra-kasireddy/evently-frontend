import { Camera, Eye, Star } from 'lucide-react';
import type { OrganizerPublicPreview } from '../types';
import styles from './LivePreview.module.css';

export interface LivePreviewProps {
  preview: OrganizerPublicPreview | undefined;
  categoryLabel: (key: string) => string;
}

/**
 * The customer-facing profile card, rendered from the same projection the
 * customer app receives (`GET /organizer/profile/preview`), so what the
 * organizer sees here cannot drift from the real thing.
 */
export function LivePreview({ preview, categoryLabel }: LivePreviewProps) {
  return (
    <aside className={styles.wrap}>
      <h2 className={styles.caption}>
        <Eye size={15} /> Live customer preview
      </h2>

      {!preview ? (
        <p className={styles.pending}>Your customer-facing card appears here once it loads.</p>
      ) : (
        <>
          <div className={styles.card}>
            <div className={styles.banner}>
              {preview.coverPhoto ? (
                <img src={preview.coverPhoto.url} alt="" className={styles.cover} />
              ) : (
                <span className={styles.blob} aria-hidden />
              )}
            </div>

            <div className={styles.body}>
              <div className={styles.avatarFrame}>
                {preview.profilePhoto ? (
                  <img src={preview.profilePhoto.url} alt="" className={styles.avatarImg} />
                ) : (
                  <span
                    className={styles.avatarInitials}
                    style={{ backgroundColor: preview.avatarColor || 'var(--color-navy)' }}
                  >
                    {preview.initials || preview.businessName.slice(0, 2).toUpperCase() || 'EV'}
                  </span>
                )}
              </div>

              <div className={styles.nameRow}>
                <h3 className={styles.name}>
                  {preview.displayName || preview.businessName || 'Your business name'}
                </h3>
                {preview.tier && <span className={styles.tier}>{preview.tier}</span>}
              </div>

              <p className={preview.tagline ? styles.tagline : styles.taglineEmpty}>
                {preview.tagline || 'Add a tagline so customers know what you do at a glance.'}
              </p>

              <p className={styles.rating}>
                <Star size={13} className={styles.star} />
                <strong>{preview.rating ? preview.rating.toFixed(1) : 'New'}</strong>
                {preview.reviews > 0 && <span>({preview.reviews} reviews)</span>}
                {preview.city && <span className={styles.city}>· {preview.city}</span>}
              </p>

              {preview.secondaryCategories.length > 0 && (
                <ul className={styles.tags}>
                  {preview.secondaryCategories.slice(0, 6).map((key) => (
                    <li key={key} className={styles.tag}>
                      {categoryLabel(key)}
                    </li>
                  ))}
                </ul>
              )}

              <div className={styles.grid}>
                {preview.gallery.slice(0, 3).map((image) => (
                  <img key={image.key} src={image.url} alt="" className={styles.gridImg} />
                ))}
                {Array.from({ length: Math.max(0, 3 - preview.gallery.length) }).map((_, i) => (
                  <span key={`placeholder-${i}`} className={styles.gridEmpty} aria-hidden>
                    <Camera size={16} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {!preview.isLive && (
            <p className={styles.notLive}>
              This is how your profile will look. It becomes visible to customers once Evently
              approves your submitted details.
            </p>
          )}
        </>
      )}
    </aside>
  );
}
