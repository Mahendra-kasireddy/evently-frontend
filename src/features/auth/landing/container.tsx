import {
  useCategories, useFaqs, useFeatures, useFeaturedEvents,
  useStatistics, useSteps, useTestimonials,
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
  const statistics = useStatistics();
  const steps = useSteps();
  const categories = useCategories();
  const features = useFeatures();
  const testimonials = useTestimonials();
  const vendors = useFeaturedEvents();
  const faqs = useFaqs();

  return (
    <Component
      statistics={toData(statistics)}
      steps={toData(steps)}
      categories={toData(categories)}
      features={toData(features)}
      testimonials={toData(testimonials)}
      vendors={toData(vendors)}
      faqs={toData(faqs)}
    />
  );
}
