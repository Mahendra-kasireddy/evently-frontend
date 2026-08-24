import {
  Hero,
  BookedEvent,
  CurrentEvent,
  PlanGrid,
  HowItWorks,
  TopOrganizers,
  PackagesCarousel,
  PlanSmarter,
  SectionBoundary,
} from './sections';
import type { CustomerHomeData } from './types';
import styles from './styles.module.css';

export interface CustomerHomeComponentProps {
  data: CustomerHomeData;
}

/**
 * Presentational customer home content. Header/footer live in CustomerLayout.
 *
 * Two rules run through this file:
 *  - Every section is wrapped in a boundary, so one section failing leaves the
 *    rest of the page usable instead of white-screening it.
 *  - A section with nothing to show and no useful fallback is not rendered at
 *    all, so the page never carries an empty heading or a blank band. The one
 *    exception is Top Organizers, which owns its own "explore other areas"
 *    fallback (a customer with no organizers nearby still needs a way forward).
 */
export function Component({ data }: CustomerHomeComponentProps) {
  const hasOccasions = data.planSection.occasions.length > 0;
  const hasSteps = data.howItWorks.steps.length > 0;
  const hasPackages = data.packages.items.length > 0;
  const hasTools = data.tools.tools.length > 0;

  /*
   * One event slot, never two. Once the booking is live the rich BOOKED card is
   * the honest summary — progress, milestones, countdown, workspace — and the
   * compact CurrentEvent widget would only repeat it a row below. Before that
   * (draft, awaiting quotes, comparing, just-accepted) there is no booking yet,
   * so the compact widget carries the next action on its own.
   */
  const bookedEvent = data.bookedEvent;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <SectionBoundary name="hero">
          <Hero data={data.hero} initials={data.user.initials} />
        </SectionBoundary>

        {/* Per-user, and absent until an event exists — the slot renders
            nothing at all rather than an empty placeholder. */}
        {bookedEvent ? (
          <SectionBoundary name="booked-event">
            <BookedEvent data={bookedEvent} />
          </SectionBoundary>
        ) : (
          data.currentEvent && (
            <SectionBoundary name="current-event">
              <CurrentEvent data={data.currentEvent} />
            </SectionBoundary>
          )
        )}

        {hasOccasions && (
          <SectionBoundary name="plan-grid">
            <PlanGrid data={data.planSection} />
          </SectionBoundary>
        )}

        {hasSteps && (
          <SectionBoundary name="how-it-works">
            <HowItWorks data={data.howItWorks} />
          </SectionBoundary>
        )}

        <SectionBoundary name="top-organizers">
          <TopOrganizers data={data.topOrganizers} />
        </SectionBoundary>

        {hasPackages && (
          <SectionBoundary name="packages">
            <PackagesCarousel data={data.packages} />
          </SectionBoundary>
        )}

        {hasTools && (
          <SectionBoundary name="tools">
            <PlanSmarter data={data.tools} />
          </SectionBoundary>
        )}
      </div>
    </main>
  );
}
