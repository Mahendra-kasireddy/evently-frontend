import { Mail, Phone } from 'lucide-react';
import { AsyncSection, Button } from '@shared/reusable';
import { JOIN_COPY } from './constants';
import { RoleCard, CityChips } from './sections';
import type { City, JoinRole } from './types';
import styles from './styles.module.css';

interface Slice<T> { data: T[]; isLoading: boolean; isError: boolean }
export interface JoinComponentProps {
  roles: Slice<JoinRole>;
  cities: Slice<City>;
}

/** Role-selection card: heading, city filter, role cards, OAuth options. */
export function Component({ roles, cities }: JoinComponentProps) {
  return (
    <div className={styles.card}>
      <h1 className={styles.title}>
        {JOIN_COPY.titleLead} <em className={styles.accent}>{JOIN_COPY.titleAccent}</em>
      </h1>
      <p className={styles.subtitle}>{JOIN_COPY.subtitle}</p>

      <AsyncSection
        isLoading={cities.isLoading} isError={cities.isError}
        loading={<div className={styles.chipsSkeleton} aria-hidden />}
      >
        <CityChips cities={cities.data} />
      </AsyncSection>

      <div className={styles.roles}>
        <AsyncSection
          isLoading={roles.isLoading} isError={roles.isError} isEmpty={roles.data.length === 0}
          loading={Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={styles.cardSkeleton} aria-hidden />
          ))}
        >
          {roles.data.map((r) => <RoleCard key={r.id} role={r} />)}
        </AsyncSection>
      </div>

      <div className={styles.or}><span>{JOIN_COPY.orLabel}</span></div>

      <div className={styles.oauth}>
        <Button variant="secondary" size="lg"><Mail size={18} /> {JOIN_COPY.google}</Button>
        <Button variant="secondary" size="lg"><Phone size={18} /> {JOIN_COPY.phone}</Button>
      </div>
    </div>
  );
}
