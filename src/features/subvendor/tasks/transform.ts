import { formatINR } from '@features/organizer/quotes/transform';

export { formatINR };

/** Dates on tasks/bookings are UTC-midnight instants for a calendar day — format in UTC. */
export function dateLabel(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
