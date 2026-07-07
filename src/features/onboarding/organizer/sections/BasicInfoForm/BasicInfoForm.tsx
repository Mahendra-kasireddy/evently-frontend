import { useState, type FormEvent } from 'react';
import { ChevronRight } from 'lucide-react';
import { Input, Button } from '@shared/reusable';
import { CATEGORIES, CITIES } from '../../constants';
import type { BasicInfoFieldErrors, BasicInfoValues } from '../../types';
import styles from './BasicInfoForm.module.css';

export interface BasicInfoFormProps {
  onSubmit: (values: BasicInfoValues) => void;
  isPending: boolean;
  fieldErrors: BasicInfoFieldErrors;
  formError?: string;
}

const EMPTY: BasicInfoValues = { businessName: '', fullName: '', email: '', city: '', category: '' };

export function BasicInfoForm({ onSubmit, isPending, fieldErrors, formError }: BasicInfoFormProps) {
  const [values, setValues] = useState<BasicInfoValues>(EMPTY);
  const update = (key: keyof BasicInfoValues, val: string) => setValues((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <h2 className={styles.heading}>Basic info</h2>
      <p className={styles.sub}>Tell us about your business so families can find you.</p>

      <div className={styles.grid2}>
        <Input label="Business / display name" required value={values.businessName}
          onChange={(e) => update('businessName', e.target.value)}
          {...(fieldErrors.businessName ? { error: fieldErrors.businessName } : {})} />
        <Input label="Full name" required value={values.fullName}
          onChange={(e) => update('fullName', e.target.value)}
          {...(fieldErrors.fullName ? { error: fieldErrors.fullName } : {})} />
      </div>

      <Input label="Email" type="email" required value={values.email}
        onChange={(e) => update('email', e.target.value)}
        {...(fieldErrors.email ? { error: fieldErrors.email } : {})} />

      <div className={styles.grid2}>
        <label className={styles.field}>
          <span className={styles.label}>City <span className={styles.req}>*</span></span>
          <select className={styles.select} value={values.city} onChange={(e) => update('city', e.target.value)}>
            <option value="">Select city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {fieldErrors.city && <span className={styles.err} role="alert">{fieldErrors.city}</span>}
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Primary category <span className={styles.req}>*</span></span>
          <select className={styles.select} value={values.category} onChange={(e) => update('category', e.target.value)}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {fieldErrors.category && <span className={styles.err} role="alert">{fieldErrors.category}</span>}
        </label>
      </div>

      {formError && <p className={styles.formErr} role="alert">{formError}</p>}

      <p className={styles.legend}><span className={styles.req}>*</span> Required fields · <span className={styles.secure}>🔒 Your details are encrypted</span></p>
      <div className={styles.actions}>
        <Button type="submit" variant="brand" size="lg" isLoading={isPending}>
          Save &amp; continue <ChevronRight size={18} />
        </Button>
      </div>
    </form>
  );
}
