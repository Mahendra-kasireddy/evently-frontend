import type { PlanOrganizer, PlanFilters } from '@features/customer/plan/types';
export interface DiscoverData {
  eyebrow: string;
  heading: string;
  subtitle: string;
  organizers: PlanOrganizer[];
  filters: PlanFilters;
}
