import { Mail, Phone } from 'lucide-react';
import { AsyncSection } from '@shared/reusable';
import { Btn, BtnLink } from '@shared/partner';
import { JOIN_COPY } from './constants';
import { RoleCard, CityChips } from './sections';
import type { City, JoinRole } from './types';
import styles from './styles.module.css';

interface Slice<T> { data: T[]; isLoading: boolean; isError: boolean }
export interface JoinComponentProps {
  /** Static product copy — the two portals Evently onboards into. */
  roles: JoinRole[];
  cities: Slice<City>;
}

/** Role-selection card: heading, city chips, role cards, OAuth options. */
export function Component({ roles, cities }: JoinComponentProps) {
  return (
    <div className={styles.card}>
      <h1 className={styles.title}>
        {JOIN_COPY.titleLead} <em className={styles.accent}>{JOIN_COPY.titleAccent}</em>
      </h1>
      <p className={styles.subtitle}>{JOIN_COPY.subtitle}</p>

      <AsyncSection
        isLoading={cities.isLoading}
        isError={cities.isError}
        isEmpty={cities.data.length === 0}
        loading={<div className={styles.chipsSkeleton} aria-hidden />}
        error={
          <p className={styles.chipsNote} role="alert">
            We couldn&rsquo;t load our cities right now.
          </p>
        }
        empty={<p className={styles.chipsNote}>New cities are coming soon.</p>}
      >
        <CityChips cities={cities.data} />
      </AsyncSection>

      <div className={styles.roles}>
        {roles.map((r) => (
          <RoleCard key={r.id} role={r} />
        ))}
      </div>

      <div className={styles.or}>
        <span>{JOIN_COPY.orLabel}</span>
      </div>

      <div className={styles.oauth}>
        <Btn kind="outline" icon={<Mail size={15} />}>
          {JOIN_COPY.google}
        </Btn>
        <BtnLink to="/login" kind="outline" icon={<Phone size={15} />}>
          {JOIN_COPY.phone}
        </BtnLink>
      </div>
    </div>
  );
}
