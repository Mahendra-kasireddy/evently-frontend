import {
  useCategories, useFaqs, useFeatures, useSteps,
} from './hooks';
import { Component, type SectionData } from './Component';

interface QueryLike<T> {
  data?: T | undefined;
  isLoading: boolean;
  isError: boolean;
}

/** Map an RTK Query result to the plain data slice sections consume. */
function toData<T>(q: QueryLike<T[]>): SectionData<T> {
  return { data: q.data ?? [], isLoading: q.isLoading, isError: q.isError };
}

/**
 * Orchestration: runs every landing data hook and passes plain, loading-aware
 * slices to the presentational Component. Keeps react-query out of the UI.
 */
export function LandingContainer() {
  const steps = useSteps();
  const categories = useCategories();
  const features = useFeatures();
  const faqs = useFaqs();

  return (
    <Component
      steps={toData(steps)}
      categories={toData(categories)}
      features={toData(features)}
      faqs={toData(faqs)}
    />
  );
}
