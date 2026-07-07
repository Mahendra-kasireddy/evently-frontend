import { Hero, BookedEvent, PlanGrid, HowItWorks, TopOrganizers, PackagesCarousel, PlanSmarter } from './sections';
import type { CustomerHomeData } from './types';
import styles from './styles.module.css';

export interface CustomerHomeComponentProps {
  data: CustomerHomeData;
}

/** Presentational customer home content. Header/footer live in CustomerLayout. */
export function Component({ data }: CustomerHomeComponentProps) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Hero data={data.hero} initials={data.user.initials} />
        <BookedEvent data={data.bookedEvent} />
        <PlanGrid data={data.planSection} />
        <HowItWorks data={data.howItWorks} />
        <TopOrganizers data={data.topOrganizers} />
        <PackagesCarousel data={data.packages} />
        <PlanSmarter data={data.tools} />
      </div>
    </main>
  );
}
