import { FindOrganizers } from '@features/customer/plan/sections/FindOrganizers';
import { DiscoverHero } from './sections';
import type { DiscoverData } from './types';
import styles from './styles.module.css';

export function Component({ data }: { data: DiscoverData }) {
  return (
    <>
      <main className={styles.page}>
        <div className={styles.container}>
          <DiscoverHero eyebrow={data.eyebrow} heading={data.heading} subtitle={data.subtitle} />
          <FindOrganizers organizers={data.organizers} filters={data.filters} />
        </div>
      </main>
    </>
  );
}
