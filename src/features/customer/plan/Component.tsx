import { Info } from 'lucide-react';
import { PlanHero, Stepper, OccasionPicker, EventDetailsForm, IdeasRequests, CategoriesStep, FindOrganizers, SummarySidebar } from './sections';
import type { PlanData, PlanDraft } from './types';
import styles from './styles.module.css';

function renderBanner(text: string) {
  const idx = text.indexOf('. ');
  if (idx === -1) return text;
  return (<><strong>{text.slice(0, idx + 1)}</strong>{text.slice(idx + 1)}</>);
}

export interface PlanComponentProps {
  data: PlanData;
  draft: PlanDraft;
  setOccasion: (id: string) => void;
  setField: (field: keyof PlanDraft, value: string) => void;
  setStep: (n: number) => void;
  toggleCategory: (id: string) => void;
}

export function Component({ data, draft, setOccasion, setField, setStep, toggleCategory }: PlanComponentProps) {
  const occasion = data.occasions.find((o) => o.id === draft.occasionId) ?? data.occasions[0];
  if (!occasion) return null;
  const step = draft.step;
  const stepInfo = data.steps[step];
  const eyebrow = `PLAN YOUR ${occasion.label.toUpperCase()} · STEP ${step + 1} OF ${data.steps.length}`;
  const selectedCats = draft.categories
    .map((id) => data.categories.find((c) => c.id === id)?.title.split(/[ /]/)[0] ?? '')
    .filter(Boolean);

  const heroProps = step === 0
    ? { headingLead: "Let’s bring your ", headingAccent: occasion.label, headingTail: ' to life', trust: data.trust, side: { art: occasion.art, label: occasion.label } }
    : { headingLead: stepInfo?.heading ?? '', trust: [] };

  return (
    <>
      <main className={styles.page}>
        <div className={styles.container}>
          <PlanHero eyebrow={eyebrow} subtitle={stepInfo?.subtitle ?? ''} onBack={() => setStep(Math.max(step - 1, 0))} {...heroProps} />
          <Stepper steps={data.steps} current={step} onSelect={setStep} />

          {step === 2 ? (
            <FindOrganizers filters={data.filters} draft={draft} occasionLabel={occasion.label} />
          ) : (
            <div className={styles.grid}>
              <div className={styles.col}>
                {step === 0 ? (
                  <>
                    <OccasionPicker occasions={data.occasions} selectedId={draft.occasionId} onSelect={setOccasion} />
                    <EventDetailsForm draft={draft} cityOptions={data.cityOptions} guestOptions={data.guestOptions} onField={setField} />
                    <IdeasRequests
                      config={data.ideas}
                      value={draft.ideas}
                      onAdd={(sug) => setField('ideas', draft.ideas ? `${draft.ideas}, ${sug}` : sug)}
                      onChange={(v) => setField('ideas', v)}
                    />
                    <div className={styles.banner}>
                      <Info size={17} className={styles.bannerIcon} />
                      <span>{renderBanner(data.budgetBanner)}</span>
                    </div>
                  </>
                ) : (
                  <CategoriesStep occasionLabel={occasion.label} categories={data.categories} selected={draft.categories} onToggle={toggleCategory} />
                )}
              </div>
              <SummarySidebar
                occasionLabel={occasion.label}
                draft={draft}
                steps={data.steps}
                whatNext={data.whatNext}
                quoteNote={data.quoteNote}
                continueLabel={step === 0 ? data.continueLabel : 'Continue to organizers'}
                footnote={data.footnote}
                selectedCats={step >= 1 ? selectedCats : []}
                onContinue={() => setStep(Math.min(step + 1, data.steps.length - 1))}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
