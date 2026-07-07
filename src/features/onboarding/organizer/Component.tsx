import { type NormalizedApiError } from '@lib/api';
import { Stepper, BasicInfoForm, StepPlaceholder } from './sections';
import { ONB_COPY } from './constants';
import type { BasicInfoFieldErrors, BasicInfoValues, OnboardingStep } from './types';
import styles from './styles.module.css';

export interface OnboardingComponentProps {
  steps: OnboardingStep[];
  currentId: string;
  goToStep: (id: string) => void;
  submitBasicInfo: (values: BasicInfoValues) => void;
  isSaving: boolean;
  fieldErrors: BasicInfoFieldErrors;
  error: NormalizedApiError | null;
}

export function Component(props: OnboardingComponentProps) {
  const { steps, currentId, goToStep, submitBasicInfo, isSaving, fieldErrors, error } = props;
  const current = steps.find((s) => s.id === currentId);

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h1 className={styles.title}>{ONB_COPY.title}</h1>
        <p className={styles.subtitle}>{ONB_COPY.subtitle}</p>
      </header>

      <div className={styles.grid}>
        <Stepper steps={steps} onSelect={goToStep} note={ONB_COPY.verifyNote} />
        <section className={styles.panel}>
          {currentId === 'basic' ? (
            <BasicInfoForm
              onSubmit={submitBasicInfo}
              isPending={isSaving}
              fieldErrors={fieldErrors}
              {...(error ? { formError: error.message } : {})}
            />
          ) : (
            <StepPlaceholder title={current?.title ?? 'Next step'} />
          )}
        </section>
      </div>
    </div>
  );
}
