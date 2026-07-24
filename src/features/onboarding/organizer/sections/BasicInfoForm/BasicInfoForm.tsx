import { useRef, type ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { Input } from '@shared/reusable';
import { SelectField } from '../Fields';
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

  return (
    <div className={form.form}>
      <div className={styles.photoRow}>
        {files.profilePhoto ? (
          <img src={files.profilePhoto.url} alt="Profile" className={styles.photoPreview} />
        ) : (
          <span className={styles.photoPlaceholder}>
            <Upload size={22} />
          </span>
        )}
        <div className={styles.photoActions}>
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={() => fileRef.current?.click()}
            disabled={onb.uploadingField === 'profilePhoto'}
          >
            <Upload size={15} />
            {onb.uploadingField === 'profilePhoto'
              ? 'Uploading…'
              : files.profilePhoto
                ? 'Change photo'
                : 'Upload photo'}
          </button>
          <span className={styles.hint}>JPG, PNG or WebP · up to 5MB</span>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto} hidden />
      </div>

      <div className={form.grid2}>
        <Input
          label="First name"
          required
          value={values.firstName}
          onChange={(e) => onb.setField('firstName', e.target.value)}
          {...(fieldErrors.firstName ? { error: fieldErrors.firstName } : {})}
        />
        <Input
          label="Last name"
          required
          value={values.lastName}
          onChange={(e) => onb.setField('lastName', e.target.value)}
          {...(fieldErrors.lastName ? { error: fieldErrors.lastName } : {})}
        />
      </div>

      <div className={form.grid2}>
        <label className={styles.field}>
          <span className={styles.label}>Mobile (verified)</span>
          <span className={styles.readonly}>{mobile || '—'}</span>
        </label>
        <Input
          label="Contact email"
          type="email"
          required
          value={values.contactEmail}
          onChange={(e) => onb.setField('contactEmail', e.target.value)}
          {...(fieldErrors.contactEmail ? { error: fieldErrors.contactEmail } : {})}
        />
      </div>

      <div className={form.grid2}>
        <Input
          label="Business name"
          required
          value={values.businessName}
          onChange={(e) => onb.setField('businessName', e.target.value)}
        />
        <Input
          label="Display name"
          value={values.displayName}
          onChange={(e) => onb.setField('displayName', e.target.value)}
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
