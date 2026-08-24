import { useState, type FormEvent } from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import { Button, Input } from '@shared/reusable';
import { LocationPicker } from '@shared/components';
import { WELCOME_COPY as COPY, WELCOME_STEPS } from './constants';
import styles from './styles.module.css';

export interface WelcomeComponentProps {
  step: 1 | 2;
  name: string;
  setName: (v: string) => void;
  nameError: string | undefined;
  onSubmitName: () => void;
  cities: string[];
  citiesLoading: boolean;
  recent: string[];
  city: string | undefined;
  onSelectCity: (city: string) => void;
  onSkipCity: () => void;
  isSaving: boolean;
  error: string | undefined;
}

/** Post-OTP onboarding: preferred name, then location. Pure presentation. */
export function Component({
  step,
  name,
  setName,
  nameError,
  onSubmitName,
  cities,
  citiesLoading,
  recent,
  city,
  onSelectCity,
  onSkipCity,
  isSaving,
  error,
}: WelcomeComponentProps) {
  const [touched, setTouched] = useState(false);

  const submitName = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    onSubmitName();
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <span className={styles.badge}>
          {step === 1 ? <Sparkles size={22} /> : <MapPin size={22} />}
        </span>
        <span className={styles.step}>{COPY.step(step, WELCOME_STEPS)}</span>

        {step === 1 ? (
          <>
            <h1 className={styles.title}>{COPY.nameTitle}</h1>
            <p className={styles.sub}>{COPY.nameSub}</p>
            <form onSubmit={submitName} noValidate className={styles.form}>
              <Input
                label={COPY.nameLabel}
                placeholder={COPY.namePlaceholder}
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                {...(touched && nameError ? { error: nameError } : {})}
              />
              <Button
                type="submit"
                variant="brand"
                size="lg"
                className={styles.cta}
                isLoading={isSaving}
              >
                {isSaving ? COPY.saving : COPY.continue}
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className={styles.title}>{COPY.locationTitle}</h1>
            <p className={styles.sub}>{COPY.locationSub}</p>
            <div className={styles.picker}>
              <LocationPicker
                cities={cities}
                citiesLoading={citiesLoading}
                recent={recent}
                selected={city}
                onSelect={onSelectCity}
                busy={isSaving}
              />
            </div>
            <button type="button" className={styles.skip} onClick={onSkipCity} disabled={isSaving}>
              {COPY.locationSkip}
            </button>
          </>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

export default Component;
