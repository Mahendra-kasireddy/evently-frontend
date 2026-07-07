import { Header, Footer } from '@shared/components';
import { Reveal } from '@shared/reusable';
import {
  Hero, HowItWorks, Categories, WhyEvently, AfterBooking,
  Testimonials, AppDownload, Faq, OrganizerCta,
} from './sections';
import type {
  Category, FaqItem, Feature, FeaturedEvent, HowItWorksStep,
  Statistic, Testimonial,
} from './types';

/** Loading/error-aware data slice handed to a section. */
export interface SectionData<T> {
  data: T[];
  isLoading: boolean;
  isError: boolean;
}

export interface LandingComponentProps {
  statistics: SectionData<Statistic>;
  steps: SectionData<HowItWorksStep>;
  categories: SectionData<Category>;
  features: SectionData<Feature>;
  testimonials: SectionData<Testimonial>;
  vendors: SectionData<FeaturedEvent>;
  faqs: SectionData<FaqItem>;
}

/**
 * The landing page's entire UI, assembled from section pieces. Pure: receives
 * all data + loading/error flags as props and passes them down. Sections fade
 * up on scroll via <Reveal>; Hero animates on load (it's in view immediately).
 */
export function Component(props: LandingComponentProps) {
  const { statistics, steps, categories, features, testimonials, vendors, faqs } = props;
  return (
    <>
      <Header />
      <Reveal>
        <Hero statistics={statistics.data} statsLoading={statistics.isLoading} />
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
        <Testimonials testimonials={testimonials.data} isLoading={testimonials.isLoading} isError={testimonials.isError} />
      </Reveal>
      <Reveal>
        <AppDownload vendors={vendors.data} isLoading={vendors.isLoading} isError={vendors.isError} />
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
