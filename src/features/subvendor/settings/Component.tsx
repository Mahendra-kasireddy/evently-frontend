import { AlertCircle, Bell, Check, LogOut, Pencil, X } from 'lucide-react';
import { SETTINGS_COPY as COPY } from './constants';
import type { AccountDetails, AccountEdits, AccountFieldErrors } from './types';
import type { SubVendorProfile } from '@features/subvendor/profile/types';
import styles from './styles.module.css';

export interface SettingsComponentProps {
  account: AccountDetails;
  profile: SubVendorProfile | undefined;
  editing: boolean;
  edits: AccountEdits;
  errors: AccountFieldErrors;
  saved: boolean;
  saveError: string | null;
  isSaving: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onEdit: <K extends keyof AccountEdits>(key: K, value: AccountEdits[K]) => void;
  onSave: () => void;
  onAvailability: (active: boolean) => void;
  onSignOut: () => void;
}

function Row({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowRight}>
        <strong className={styles.rowValue}>{value}</strong>
        {note && <small className={styles.rowNote}>{note}</small>}
      </span>
    </div>
  );
}

/**
 * Sub-vendor settings.
 *
 * The sidebar's Settings link used to point at `/settings` — the *customer*
 * settings page, which renders inside CustomerLayout, so a sub-vendor clicking
 * it was thrown out of their own portal into the customer shell. That page is
 * also a placeholder whose toggles are local state and persist nothing.
 *
 * Everything here writes to an endpoint that exists. Where something isn't
 * supported — notification preferences — it says so instead of rendering a
 * switch that does nothing.
 */
export function Component({
  account,
  profile,
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
  onSignOut,
}: SettingsComponentProps) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.head}>
          <h1 className={styles.title}>{COPY.title}</h1>
          <p className={styles.subtitle}>{COPY.subtitle}</p>
        </header>

        {saveError && (
          <p className={styles.errBanner} role="alert">
            <AlertCircle size={15} /> {saveError}
          </p>
        )}

        {/* ------------------------------------------------------- account */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>{COPY.accountTitle}</h2>
              <p className={styles.panelNote}>{COPY.accountNote}</p>
            </div>
            {!editing && (
              <button type="button" className={styles.editBtn} onClick={onStartEditing}>
                <Pencil size={14} /> Edit
              </button>
            )}
          </div>

          {saved && !editing && (
            <p className={styles.savedNote} role="status">
              <Check size={14} /> Saved.
            </p>
          )}

          {editing ? (
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="sv-s-name">
                  Name
                </label>
                <input
                  id="sv-s-name"
                  className={`${styles.input} ${errors.name ? styles.inputBad : ''}`}
                  value={edits.name}
                  onChange={(e) => onEdit('name', e.target.value)}
                  maxLength={80}
                  autoComplete="name"
                />
                {errors.name && (
                  <p className={styles.err} role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="sv-s-email">
                  Email
                </label>
                <input
                  id="sv-s-email"
                  className={`${styles.input} ${errors.email ? styles.inputBad : ''}`}
                  type="email"
                  value={edits.email}
                  onChange={(e) => onEdit('email', e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className={styles.err} role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="sv-s-city">
                  City
                </label>
                <input
                  id="sv-s-city"
                  className={`${styles.input} ${errors.city ? styles.inputBad : ''}`}
                  value={edits.city}
                  onChange={(e) => onEdit('city', e.target.value)}
                  placeholder="Hyderabad"
                  maxLength={120}
                />
                {errors.city && (
                  <p className={styles.err} role="alert">
                    {errors.city}
                  </p>
                )}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={onCancelEditing}
                  disabled={isSaving}
                >
                  <X size={15} /> Cancel
                </button>
                <button type="button" className={styles.saveBtn} onClick={onSave} disabled={isSaving}>
                  <Check size={15} /> {isSaving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <Row label="Name" value={account.name || 'Not set'} />
              <Row label="Email" value={account.email || 'Not set'} />
              <Row label="City" value={account.city || 'Not set'} />
              {/* The OTP login identity. Changing it means re-verifying a new
                  number, which is a flow of its own — not a text field. */}
              <Row
                label="Mobile"
                value={account.phone ? `+91 ${account.phone}` : 'Not set'}
                note="Used to sign in"
              />
            </>
          )}
        </section>

        {/* -------------------------------------------------- availability */}
        {profile && (
          <section className={`${styles.panel} ${styles.availability}`}>
            <div className={styles.availText}>
              <h2 className={styles.panelTitle}>{COPY.availabilityTitle}</h2>
              <p className={styles.panelNote}>
                {profile.active
                  ? 'Organizers can find you and assign new tasks.'
                  : 'You’re hidden from organizers looking for new vendors. Tasks you’ve already accepted are unaffected.'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={profile.active}
              aria-label={COPY.availabilityTitle}
              className={`${styles.switch} ${profile.active ? styles.switchOn : ''}`}
              disabled={isSaving}
              onClick={() => onAvailability(!profile.active)}
            >
              <span className={styles.knob} />
            </button>
          </section>
        )}

        {/* ------------------------------------------------- notifications */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>{COPY.notificationsTitle}</h2>
          <p className={styles.infoBox}>
            <Bell size={15} /> <span>{COPY.notificationsBody}</span>
          </p>
        </section>

        {/* ------------------------------------------------------- session */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>{COPY.dangerTitle}</h2>
          <p className={styles.panelNote}>{COPY.signOutNote}</p>
          <button type="button" className={styles.signOut} onClick={onSignOut}>
            <LogOut size={16} /> {COPY.signOut}
          </button>
        </section>
      </div>
    </main>
  );
}
