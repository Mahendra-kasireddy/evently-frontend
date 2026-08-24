import { Info } from 'lucide-react';
import { EmptyState } from '@shared/components';
import { PlanHero, Stepper, OccasionPicker, EventDetailsForm, IdeasRequests, CategoriesStep, FindOrganizers, ReviewStep, SummarySidebar } from './sections';
import type { PlanData, PlanDraft, PlanStep } from './types';
import styles from './styles.module.css';

function renderBanner(text: string) {
  const idx = text.indexOf('. ');
  if (idx === -1) return text;
  return (<><strong>{text.slice(0, idx + 1)}</strong>{text.slice(idx + 1)}</>);
}

/** Fallback Review step used only if the CMS config predates it (before re-seed). */
const REVIEW_FALLBACK: PlanStep = {
  id: 'review',
  label: 'Review',
  heading: 'Review & submit',
  subtitle: 'Check everything looks right, then submit your plan and request a quote. You can go back and edit any step.',
};

/** Per-step gate for advancing: returns a reason string when the step is incomplete. */
function blockReasonFor(step: number, draft: PlanDraft): string | undefined {
  if (step === 0) {
    if (!draft.city.trim()) return 'Add your event city to continue.';
    if (!draft.guests) return 'Choose a guest count to continue.';
  }
  if (step === 1 && draft.categories.length === 0) {
    return 'Pick at least one service to continue.';
  }
  return undefined;
}

export interface PlanComponentProps {
  data: PlanData;
  draft: PlanDraft;
  setOccasion: (id: string) => void;
  setField: (field: keyof PlanDraft, value: string) => void;
  setStep: (n: number) => void;
  setSelectedOrganizer: (id: string) => void;
  toggleCategory: (id: string) => void;
}

export function Component({ data, draft, setOccasion, setField, setStep, setSelectedOrganizer, toggleCategory }: PlanComponentProps) {
  // Defensive defaults — never crash if the API omits an array (e.g. an older
  // backend without budgetOptions, or config not yet re-seeded).
  const occasions = data.occasions ?? [];
  const cmsSteps = data.steps ?? [];
  const categories = data.categories ?? [];
  const budgetOptions = data.budgetOptions ?? [];
  const cityOptions = data.cityOptions ?? [];
  const guestOptions = data.guestOptions ?? [];

  const occasion = occasions.find((o) => o.id === draft.occasionId) ?? occasions[0];
  // No occasions means the planner has nothing to offer — say so rather than
  // rendering a blank page.
  if (!occasion) {
    return (
      <EmptyState
        icon={Info}
        title="The planner isn’t available right now"
        message="We couldn’t load the event types to choose from. Please refresh in a moment — nothing you enter is lost."
      />
    );
  }

  // Ensure the Review step exists even if the CMS config hasn't been re-seeded.
  const steps = cmsSteps.some((s) => s.id === 'review') ? cmsSteps : [...cmsSteps, REVIEW_FALLBACK];
  const reviewIndex = steps.findIndex((s) => s.id === 'review');
  const organizersIndex = steps.findIndex((s) => s.id === 'organizers');

  const step = draft.step;
  const stepInfo = steps[step];
  const eyebrow = `PLAN YOUR ${occasion.label.toUpperCase()} · STEP ${step + 1} OF ${steps.length}`;
  const selectedCats = draft.categories
    .map((id) => categories.find((c) => c.id === id)?.title.split(/[ /]/)[0] ?? '')
    .filter(Boolean);

  const blockReason = blockReasonFor(step, draft);
  const canContinue = !blockReason;

  const heroProps = step === 0
    ? { headingLead: "Let’s bring your ", headingAccent: occasion.label, headingTail: ' to life', trust: data.trust ?? [], side: { art: occasion.art, label: occasion.label } }
    : { headingLead: stepInfo?.heading ?? '', trust: [] };

  const selectOrganizer = (id: string) => {
    setSelectedOrganizer(id);
    setStep(reviewIndex);
  };

  return (
    <>
      <main className={styles.page}>
        <div className={styles.container}>
          <PlanHero eyebrow={eyebrow} subtitle={stepInfo?.subtitle ?? ''} onBack={() => setStep(Math.max(step - 1, 0))} {...heroProps} />
          <Stepper steps={steps} current={step} onSelect={setStep} />

          {step === organizersIndex ? (
            <FindOrganizers filters={data.filters} draft={draft} occasionLabel={occasion.label} onSelectOrganizer={selectOrganizer} />
          ) : step === reviewIndex ? (
            <ReviewStep data={data} draft={draft} occasionLabel={occasion.label} onEdit={setStep} />
          ) : (
            <div className={styles.grid}>
              <div className={styles.col}>
                {step === 0 ? (
                  <>
                    <OccasionPicker occasions={occasions} selectedId={draft.occasionId} onSelect={setOccasion} />
                    <EventDetailsForm draft={draft} cityOptions={cityOptions} guestOptions={guestOptions} budgetOptions={budgetOptions} onField={setField} />
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
                  <CategoriesStep occasionLabel={occasion.label} categories={categories} selected={draft.categories} onToggle={toggleCategory} />
                )}
              </div>
              <SummarySidebar
                occasionLabel={occasion.label}
                draft={draft}
                steps={steps}
                whatNext={data.whatNext}
                quoteNote={data.quoteNote}
                continueLabel={step === 0 ? data.continueLabel : 'Continue to organizers'}
                footnote={data.footnote}
                selectedCats={step >= 1 ? selectedCats : []}
                canContinue={canContinue}
                blockReason={blockReason}
                onContinue={() => { if (canContinue) setStep(Math.min(step + 1, steps.length - 1)); }}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
