import { Header, Footer } from '@shared/components';
import { Reveal } from '@shared/reusable';
import {
  Hero, HowItWorks, Categories, WhyEvently, AfterBooking,
  AppDownload, Faq, OrganizerCta,
} from './sections';
import type {
  Category, FaqItem, Feature, HowItWorksStep,
} from './types';

/** Loading/error-aware data slice handed to a section. */
export interface SectionData<T> {
  data: T[];
  isLoading: boolean;
  isError: boolean;
}

export interface LandingComponentProps {
  steps: SectionData<HowItWorksStep>;
  categories: SectionData<Category>;
  features: SectionData<Feature>;
  faqs: SectionData<FaqItem>;
}

/**
 * The landing page's entire UI, assembled from section pieces. Pure: receives
 * all data + loading/error flags as props and passes them down. Sections fade
 * up on scroll via <Reveal>; Hero animates on load (it's in view immediately).
 */
export function Component(props: LandingComponentProps) {
  const { steps, categories, features, faqs } = props;
  return (
    <>
      <Header />
      <Reveal>
        <Hero />
      </Reveal>
      <Reveal>
        <HowItWorks steps={steps.data} isLoading={steps.isLoading} isError={steps.isError} />
      </Reveal>
      <Reveal>
        <Categories categories={categories.data} isLoading={categories.isLoading} isError={categories.isError} />
      </Reveal>
      <Reveal>
        <WhyEvently features={features.data} isLoading={features.isLoading} isError={features.isError} />
      </Reveal>
      <Reveal>
        <AfterBooking />
      </Reveal>
      <Reveal>
        <AppDownload />
      </Reveal>
      <Reveal>
        <Faq faqs={faqs.data} isLoading={faqs.isLoading} isError={faqs.isError} />
      </Reveal>
      <Reveal>
        <OrganizerCta />
      </Reveal>
      <Footer />
    </>
  );
}
