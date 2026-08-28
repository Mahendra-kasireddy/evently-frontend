import { Check } from 'lucide-react';
import { OTHER_CATEGORY_ID, VENDOR_CATEGORIES } from '../../constants';
import type { SubvendorDraft, SubvendorFieldErrors } from '../../types';
import styles from '../Step.module.css';

export interface DetailsStepProps {
  draft: SubvendorDraft;
  errors: SubvendorFieldErrors;
  setField: <K extends keyof SubvendorDraft>(key: K, value: SubvendorDraft[K]) => void;
}

export function DetailsStep({ draft, errors, setField }: DetailsStepProps) {
  const isOther = draft.categoryId === OTHER_CATEGORY_ID;

  return (
    <div className={styles.step}>
      <p className={styles.eyebrow}>STEP 1 OF 3</p>
      <h1 className={styles.title}>Your details</h1>
      <p className={styles.subtitle}>Tell us what you do and where you work.</p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="sv-name">
          Full name
        </label>
        <input
          id="sv-name"
          className={`${styles.input} ${errors.fullName ? styles.inputBad : ''}`}
          value={draft.fullName}
          onChange={(e) => setField('fullName', e.target.value)}
          placeholder="Ramesh Kumar"
          autoComplete="name"
          aria-invalid={errors.fullName ? true : undefined}
        />
        {errors.fullName && (
          <p className={styles.err} role="alert">
            {errors.fullName}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <span className={styles.label} id="sv-cat-label">
          What do you do?
        </span>
        <span className={styles.hint}>
          This decides how organizers find you, and how your rate is priced.
        </span>

        <div className={styles.grid} role="radiogroup" aria-labelledby="sv-cat-label">
          {VENDOR_CATEGORIES.map((c) => {
            const Icon = c.icon;
            const selected = draft.categoryId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`${styles.tile} ${selected ? styles.tileOn : ''} ${
                  c.id === OTHER_CATEGORY_ID ? styles.tileOther : ''
                }`}
                onClick={() => setField('categoryId', c.id)}
              >
                <Icon size={17} className={styles.tileIcon} />
                <span>{c.label}</span>
                {selected && <Check size={15} className={styles.tileIcon} />}
              </button>
            );
          })}
        </div>

        {errors.categoryId && (
          <p className={styles.err} role="alert">
            {errors.categoryId}
          </p>
        )}

        {/*
          The escape hatch. It is honest about what happens next: Evently has a
          fixed set of categories that organizers filter by, so a trade outside
          them is recorded in the vendor's own words and passed to the team
          rather than silently becoming a category nobody can search for.
        */}
        {isOther && (
          <div className={styles.otherPanel}>
            <label className={styles.label} htmlFor="sv-custom-cat">
              What should we call it?
            </label>
            <input
              id="sv-custom-cat"
              className={`${styles.input} ${errors.customCategory ? styles.inputBad : ''}`}
              value={draft.customCategory}
              onChange={(e) => setField('customCategory', e.target.value)}
              placeholder="Balloon artist, sound engineer, valet…"
              maxLength={60}
              aria-invalid={errors.customCategory ? true : undefined}
            />
            {errors.customCategory ? (
              <p className={styles.err} role="alert">
                {errors.customCategory}
              </p>
            ) : (
              <p className={styles.otherNote}>
                We’ll pass this to the Evently team. Until a matching category exists you’ll be
                listed under “Something else”, so organizers who browse by category may not find
                you yet.
              </p>
            )}
          </div>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="sv-area">
          Service area <span className={styles.optional}>· optional</span>
        </label>
        <input
          id="sv-area"
          className={styles.input}
          value={draft.serviceArea}
          onChange={(e) => setField('serviceArea', e.target.value)}
          placeholder="Hyderabad · Kukatpally, Miyapur"
        />
        <span className={styles.hint}>Where you’re willing to travel for a job.</span>
      </div>
    </div>
  );
}
