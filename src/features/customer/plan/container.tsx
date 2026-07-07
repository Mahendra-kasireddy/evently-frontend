import { LoadingScreen, ErrorState } from '@shared/components';
import { usePlan } from './hooks';
import { Component } from './Component';

export function PlanContainer() {
  const { data, isLoading, isError, refetch, draft, setOccasion, setField, setStep, toggleCategory } = usePlan();
  if (isError && !data) {
    return (
      <ErrorState
        message="We couldn't load the planner. Please check your connection and try again."
        onRetry={() => void refetch()}
      />
    );
  }
  if (isLoading || !data) return <LoadingScreen message="Setting up your plan…" />;
  return <Component data={data} draft={draft} setOccasion={setOccasion} setField={setField} setStep={setStep} toggleCategory={toggleCategory} />;
}
