import { useRef, type ChangeEvent } from 'react';
import { Camera, Mail, Phone } from 'lucide-react';
import { Avatar } from '@shared/partner';
import { ReadonlyField, SelectField, TextField } from '../Fields';
import type { UseOnboardingResult } from '../../hooks/useOnboarding';
import form from '../StepForm.module.css';
import styles from './BasicInfoForm.module.css';

/** Step 1 — Basic information (fields only; header/submit live in the panel). */
export function BasicInfoForm({ onb }: { onb: UseOnboardingResult }) {
  const { values, files, mobile, fieldErrors, config, configLoading } = onb;
  const fileRef = useRef<HTMLInputElement>(null);
  const onPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onb.uploadFile('profilePhoto')(f);
    e.target.value = '';
  };
  const uploading = onb.uploadingField === 'profilePhoto';
  const displayName = `${values.firstName} ${values.lastName}`.trim() || values.businessName;

  return (
    <div className={form.form}>
      <div className={styles.photoRow}>
        {files.profilePhoto ? (
          <img src={files.profilePhoto.url} alt="Profile" className={styles.photoPreview} />
        ) : (
          <Avatar name={displayName || '?'} size={70} bg="var(--c-coral-wash)" />
        )}
        <div className={styles.photoActions}>
          <div className={styles.photoLabel}>Profile photo</div>
          <button
            type="button"
            className={styles.photoBtn}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <Camera size={14} />
            {uploading ? 'Uploading…' : files.profilePhoto ? 'Change · circular crop' : 'Upload · circular crop'}
          </button>
          <span className={styles.hint}>JPG, PNG or WebP · up to 5MB</span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPhoto}
          hidden
        />
      </div>

      <div className={form.grid2}>
        <TextField
          label="First name"
          required
          value={values.firstName}
          onChange={(v) => onb.setField('firstName', v)}
          {...(fieldErrors.firstName ? { error: fieldErrors.firstName } : {})}
        />
        <TextField
          label="Last name"
          required
          value={values.lastName}
          onChange={(v) => onb.setField('lastName', v)}
          {...(fieldErrors.lastName ? { error: fieldErrors.lastName } : {})}
        />
      </div>

      <div className={form.grid2}>
        <ReadonlyField
          label="Phone (OTP verified)"
          value={mobile || '—'}
          icon={<Phone size={16} />}
          suffix={mobile ? '✓' : undefined}
        />
        <TextField
          label="Contact email"
          type="email"
          required
          icon={<Mail size={16} />}
          value={values.contactEmail}
          onChange={(v) => onb.setField('contactEmail', v)}
          {...(fieldErrors.contactEmail ? { error: fieldErrors.contactEmail } : {})}
        />
      </div>

      <div className={form.grid2}>
        <TextField
          label="Business name"
          required
          value={values.businessName}
          onChange={(v) => onb.setField('businessName', v)}
        />
        <TextField
          label="Display name"
          value={values.displayName}
          onChange={(v) => onb.setField('displayName', v)}
        />
      </div>

      <div className={form.grid2}>
        <SelectField
          label="Business type"
          required
          value={values.businessType}
          onChange={(v) => onb.setField('businessType', v)}
          options={config?.businessTypes ?? []}
          disabled={configLoading}
          placeholder="Select business type"
        />
        <SelectField
          label="Primary category"
          required
          value={values.primaryCategory}
          onChange={(v) => onb.setField('primaryCategory', v)}
          options={config?.categories ?? []}
          disabled={configLoading}
          placeholder="Select category"
        />
      </div>

      <SelectField
        label="City"
        required
        value={values.city}
        onChange={(v) => onb.setField('city', v)}
        options={(config?.cities ?? []).map((c) => ({ key: c, label: c }))}
        disabled={configLoading}
        placeholder="Select city"
      />
    </div>
  );
}
