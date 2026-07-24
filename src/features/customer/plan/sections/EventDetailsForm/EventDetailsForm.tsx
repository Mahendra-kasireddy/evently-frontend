import type { MouseEvent } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import type { PlanDraft } from '../../types';
import styles from './EventDetailsForm.module.css';

export interface EventDetailsFormProps {
  draft: PlanDraft;
  cityOptions: string[];
  guestOptions: string[];
  budgetOptions: string[];
  onField: (field: keyof PlanDraft, value: string) => void;
}

export function EventDetailsForm({ draft, cityOptions, guestOptions, budgetOptions = [], onField }: EventDetailsFormProps) {
  const today = new Date().toISOString().slice(0, 10);

  const openCalendar = (e: MouseEvent<HTMLInputElement>) => {
    // Open the native date picker when the field is clicked (supported browsers).
    (e.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
  };

  return (
    <div className={styles.form}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="plan-date">Event date</label>
          <div className={styles.control}>
            <Calendar size={16} className={styles.ctrlIcon} />
            <input
              id="plan-date"
              type="date"
              className={styles.dateInput}
              value={draft.eventDate}
              min={today}
              onClick={openCalendar}
              onChange={(e) => onField('eventDate', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="plan-city">City</label>
          <div className={styles.control}>
            <MapPin size={16} className={styles.ctrlIcon} />
            <input
              id="plan-city"
              className={styles.dateInput}
              list="plan-cities"
              value={draft.city}
              placeholder="Enter your city"
              onChange={(e) => onField('city', e.target.value)}
            />
            <datalist id="plan-cities">
              {cityOptions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="plan-area">Area / neighbourhood</label>
        <input
          id="plan-area"
          className={styles.input}
          value={draft.area}
          placeholder="e.g. Banjara Hills"
          onChange={(e) => onField('area', e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Guest count</label>
        <div className={styles.guests}>
          {guestOptions.map((g) => (
            <button
              key={g}
              type="button"
              className={`${styles.guest} ${g === draft.guests ? styles.guestOn : ''}`}
              onClick={() => onField('guests', g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {budgetOptions.length > 0 && (
        <div className={styles.field}>
          <label className={styles.label}>Budget (optional)</label>
          <div className={styles.guests}>
            {budgetOptions.map((b) => (
              <button
                key={b}
                type="button"
                className={`${styles.guest} ${b === draft.budget ? styles.guestOn : ''}`}
                onClick={() => onField('budget', b === draft.budget ? '' : b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
