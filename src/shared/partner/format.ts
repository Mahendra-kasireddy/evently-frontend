/**
 * Formatting used across the partner portals. Centralised so every screen
 * renders money, dates and relative times the same way the reference design
 * does (Indian digit grouping, `₹2.5L` style short forms, `2h ago`).
 */

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** `48000` → `₹48,000` (Indian grouping, no decimals). */
export function formatInr(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return INR.format(value);
}

/**
 * Short Indian money form used on budget chips and tiles:
 * `250000` → `₹2.5L`, `12000000` → `₹1.2Cr`, `80000` → `₹80K`.
 */
export function formatInrCompact(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  const trim = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, ''));
  if (abs >= 1_00_00_000) return `₹${trim(value / 1_00_00_000)}Cr`;
  if (abs >= 1_00_000) return `₹${trim(value / 1_00_000)}L`;
  if (abs >= 1_000) return `₹${trim(value / 1_000)}K`;
  return `₹${value}`;
}

/** `2026-05-28` → `28 May 2026`. Falls back to an em dash on bad input. */
export function formatEventDate(iso: string | null | undefined, opts?: { withYear?: boolean }): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    ...(opts?.withYear === false ? {} : { year: 'numeric' }),
  });
}

/** `just now` / `2h ago` / `1d ago` / a date once older than a week. */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatEventDate(iso);
}
