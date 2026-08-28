import { AlertCircle, Check, Pencil, X } from 'lucide-react';
import { formatINR } from '@features/subvendor/tasks/transform';
import { categoryLabelOf } from './constants';
import type { ProfileEdits, ProfileFieldErrors, SubVendorProfile } from './types';
import type { OrganizerRef } from '@features/subvendor/payments/types';
import styles from './styles.module.css';

export interface ProfileComponentProps {
  profile: SubVendorProfile;
  organizers: OrganizerRef[];
  editing: boolean;
  edits: ProfileEdits;
  errors: ProfileFieldErrors;
  saved: boolean;
  saveError: string | null;
  isSaving: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onEdit: <K extends keyof ProfileEdits>(key: K, value: ProfileEdits[K]) => void;
  onSave: () => void;
  onAvailability: (active: boolean) => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/**
 * The sub-vendor's own profile — now editable.
 *
 * It was read-only, which made onboarding's promise ("you can change it any
 * time from your profile") untrue, and left a vendor whose prices had changed
 * with no way to say so.
 *
 * Name and category are shown but not editable: category drives the rate-card
 * unit, organizer matching and the admin roster filters, so changing it after
 * the fact would silently reprice work already agreed.
 */
export function Component({
  profile,
  organizers,
  editing,
  edits,
  errors,
  saved,
  saveError,
  isSaving,
  onStartEditing,
  onCancelEditing,
  onEdit,
  onSave,
  onAvailability,
}: ProfileComponentProps) {
  const unit = profile.baseRateUnit || 'unit';

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Profile</h1>

        <section className={styles.card}>
          <span className={styles.avatar} style={{ backgroundColor: profile.avatarColor }}>
            {profile.initials}
          </span>
          <div className={styles.info}>
            <strong className={styles.name}>{profile.fullName}</strong>
            <span className={styles.category}>{categoryLabelOf(profile)}</span>
          </div>
        </section>

        {/* Availability — one switch, saved on the spot. */}
        <section className={`${styles.panel} ${styles.availability}`}>
          <div className={styles.availText}>
            <h2 className={styles.panelTitle}>Taking work</h2>
            <p className={styles.availNote}>
              {profile.active
                ? 'Organizers can find you and assign new tasks.'
                : 'You’re hidden from organizers looking for new vendors. Tasks you’ve already accepted are unaffected.'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={profile.active}
            aria-label="Taking work"
            className={`${styles.switch} ${profile.active ? styles.switchOn : ''}`}
            disabled={isSaving}
            onClick={() => onAvailability(!profile.active)}
          >
            <span className={styles.knob} />
          </button>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Details</h2>
            {!editing && (
              <button type="button" className={styles.editBtn} onClick={onStartEditing}>
                <Pencil size={14} /> Edit
              </button>
            )}
          </div>

          {saved && !editing && (
            <p className={styles.savedNote} role="status">
              <Check size={14} /> Saved. Organizers see your new rate straight away.
            </p>
          )}

          {saveError && (
            <p className={styles.errBanner} role="alert">
              <AlertCircle size={15} /> {saveError}
            </p>
          )}

          {editing ? (
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="sv-p-area">
                  Service area
                </label>
                <input
                  id="sv-p-area"
                  className={`${styles.input} ${errors.serviceArea ? styles.inputBad : ''}`}
                  value={edits.serviceArea}
                  onChange={(e) => onEdit('serviceArea', e.target.value)}
                  placeholder="Hyderabad · Kukatpally, Miyapur"
                  maxLength={120}
                />
                {errors.serviceArea && (
                  <p className={styles.err} role="alert">
                    {errors.serviceArea}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="sv-p-rate">
                  Base rate
                </label>
                <div className={`${styles.combo} ${errors.baseRate ? styles.inputBad : ''}`}>
                  <span className={styles.affix}>₹</span>
                  <input
                    id="sv-p-rate"
                    className={styles.comboInput}
                    inputMode="numeric"
                    value={edits.baseRate}
                    onChange={(e) => onEdit('baseRate', e.target.value.replace(/\D/g, ''))}
                    placeholder="Not set"
                  />
                  <span className={`${styles.affix} ${styles.affixEnd}`}>per {unit}</span>
                </div>
                {errors.baseRate && (
                  <p className={styles.err} role="alert">
                    {errors.baseRate}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="sv-p-min">
                  Minimum order
                </label>
                <div className={`${styles.combo} ${errors.minOrder ? styles.inputBad : ''}`}>
                  <input
                    id="sv-p-min"
                    className={styles.comboInput}
                    inputMode="numeric"
                    value={edits.minOrder}
                    onChange={(e) => onEdit('minOrder', e.target.value.replace(/\D/g, ''))}
                    placeholder="Not set"
                  />
                  <span className={`${styles.affix} ${styles.affixEnd}`}>{unit}s</span>
                </div>
                {errors.minOrder && (
                  <p className={styles.err} role="alert">
                    {errors.minOrder}
                  </p>
                )}
              </div>

              <p className={styles.formNote}>
                Changing your rate doesn’t alter tasks an organizer has already agreed with you.
              </p>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={onCancelEditing}
                  disabled={isSaving}
                >
                  <X size={15} /> Cancel
                </button>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={onSave}
                  disabled={isSaving}
                >
                  <Check size={15} /> {isSaving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <Row label="Service area" value={profile.serviceArea || 'Not set'} />
              <Row
                label="Base rate"
                value={profile.baseRate ? `${formatINR(profile.baseRate)} per ${unit}` : 'Not set'}
              />
              <Row
                label="Minimum order"
                value={profile.minOrder ? `${profile.minOrder} ${unit}s` : 'Not set'}
              />
            </>
          )}
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>My organizers</h2>
          {organizers.length ? (
            <div className={styles.orgList}>
              {organizers.map((o) => (
                <span key={o.id} className={styles.orgChip}>
                  {o.name}
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>
              Not linked to any organizer yet. Organizers who invite you will appear here.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
