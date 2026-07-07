import { LoadingScreen } from '@shared/components';
import { usePlan } from './hooks';
import { Component } from './Component';

export function PlanContainer() {
  const { data, isLoading, draft, setOccasion, setField, setStep, toggleCategory } = usePlan();
  if (isLoading || !data) return <LoadingScreen message="Setting up your plan…" />;
  return <Component data={data} draft={draft} setOccasion={setOccasion} setField={setField} setStep={setStep} toggleCategory={toggleCategory} />;
}
