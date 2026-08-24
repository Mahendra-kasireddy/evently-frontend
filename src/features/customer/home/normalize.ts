import type {
  BookedEventData,
  BookedEventStatus,
  BookedStep,
  HeroDraft,
  HeroOptions,
  HomeContent,
  HowIcon,
  HowItWorks,
  HowStep,
  OccasionArt,
  OccasionCard,
  OccasionIcon,
  PackageItem,
  PackagesSection,
  PlanSection,
  Tool,
  ToolIcon,
  ToolsSection,
  TrustIcon,
  TrustItem,
  NavItem,
} from './types';

/**
 * Hardening for the `customer_home` content record.
 *
 * The types say these fields exist; the database is what actually decides. A
 * record that predates a field, was edited by hand, or was never seeded used to
 * take the whole page down on `something.map(...)`. Everything below coerces to
 * a shape the sections can render, drops entries that are unusable, and keeps
 * enum values inside their unions so an icon lookup can never yield `undefined`.
 *
 * This is deliberately not a try/catch around rendering: bad data is filtered
 * where it enters the app, so each section still receives valid props.
 */

/** Anything → array. Non-arrays (null, object, string) become empty. */
function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/** Anything → trimmed string, or the fallback when absent/blank/not a string. */
function asText(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

/** Keeps an enum value only when it is one the UI knows how to render. */
function asEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

const OCCASION_ICONS: readonly OccasionIcon[] = ['heart', 'gift', 'home', 'sparkles', 'star', 'briefcase'];
const OCCASION_ARTS: readonly OccasionArt[] = ['wedding', 'birthday', 'housewarming', 'naming', 'anniversary', 'corporate'];
const TOOL_ICONS: readonly ToolIcon[] = ['wallet', 'users', 'list', 'bell'];
const HOW_ICONS: readonly HowIcon[] = ['edit', 'file', 'chart', 'shield'];
const TRUST_ICONS: readonly TrustIcon[] = ['zap', 'shield', 'star'];
const BOOKED_STATUSES: readonly BookedEventStatus[] = ['pending', 'confirmed', 'in_progress'];

export function safeNav(value: unknown): NavItem[] {
  return asArray<Partial<NavItem>>(value)
    .filter((n) => asText(n?.label) && asText(n?.to))
    .map((n) => ({ label: asText(n.label), to: asText(n.to) }));
}

export function safeDraft(value: unknown): HeroDraft {
  const d = (value ?? {}) as Partial<HeroDraft>;
  return {
    occasion: asText(d.occasion),
    when: asText(d.when),
    where: asText(d.where),
    guests: asText(d.guests),
  };
}

export function safeOptions(value: unknown): HeroOptions {
  const o = (value ?? {}) as Partial<HeroOptions>;
  return {
    occasion: asArray<string>(o.occasion).filter((s) => typeof s === 'string'),
    when: asArray<string>(o.when).filter((s) => typeof s === 'string'),
    where: asArray<string>(o.where).filter((s) => typeof s === 'string'),
    guests: asArray<string>(o.guests).filter((s) => typeof s === 'string'),
  };
}

export function safeTrust(value: unknown): TrustItem[] {
  return asArray<Partial<TrustItem>>(value)
    .filter((t) => asText(t?.label))
    .map((t) => ({ icon: asEnum(t.icon, TRUST_ICONS, 'shield'), label: asText(t.label) }));
}

export function safePlanSection(value: unknown): PlanSection {
  const s = (value ?? {}) as Partial<PlanSection>;
  const occasions: OccasionCard[] = asArray<Partial<OccasionCard>>(s.occasions)
    // An occasion with no label or no id can't be rendered or navigated to.
    .filter((o) => asText(o?.label) && asText(o?.id))
    .map((o) => ({
      id: asText(o.id),
      label: asText(o.label),
      cta: asText(o.cta, 'Start planning'),
      icon: asEnum(o.icon, OCCASION_ICONS, 'sparkles'),
      art: asEnum(o.art, OCCASION_ARTS, 'wedding'),
    }));
  return { title: asText(s.title, 'Plan by occasion'), subtitle: asText(s.subtitle), occasions };
}

export function safeHowItWorks(value: unknown): HowItWorks {
  const s = (value ?? {}) as Partial<HowItWorks>;
  const steps: HowStep[] = asArray<Partial<HowStep>>(s.steps)
    .filter((st) => asText(st?.title))
    .map((st, i) => ({
      num: asText(st.num, String(i + 1)),
      title: asText(st.title),
      description: asText(st.description),
      icon: asEnum(st.icon, HOW_ICONS, 'edit'),
    }));
  return { title: asText(s.title, 'How it works'), subtitle: asText(s.subtitle), steps };
}

export function safeTools(value: unknown): ToolsSection {
  const s = (value ?? {}) as Partial<ToolsSection>;
  const tools: Tool[] = asArray<Partial<Tool>>(s.tools)
    .filter((t) => asText(t?.title))
    .map((t, i) => ({
      id: asText(t.id, `tool-${i}`),
      title: asText(t.title),
      description: asText(t.description),
      icon: asEnum(t.icon, TOOL_ICONS, 'list'),
    }));
  return { title: asText(s.title, 'Plan smarter'), subtitle: asText(s.subtitle), tools };
}

/** Packages: copy from the CMS record, items from the live packages collection. */
export function safePackages(copy: unknown, items: unknown): PackagesSection {
  const c = (copy ?? {}) as Partial<PackagesSection>;
  const list: PackageItem[] = asArray<Partial<PackageItem>>(items)
    .filter((p) => asText(p?.title))
    .map((p, i) => ({
      id: asText(p.id, `package-${i}`),
      badge: asText(p.badge),
      title: asText(p.title),
      guests: asText(p.guests),
      budget: asText(p.budget),
      tags: asArray<string>(p.tags).filter((t) => typeof t === 'string' && t.trim()),
      art: asEnum(p.art, OCCASION_ARTS, 'wedding'),
    }));
  return {
    title: asText(c.title, 'Popular packages'),
    subtitle: asText(c.subtitle),
    buildLabel: asText(c.buildLabel, 'Build my own'),
    items: list,
  };
}

/** Top organizers: copy from the CMS record, organizers from the live query. */
export function safeTopOrganizersCopy(value: unknown): { title: string; seeAllLabel: string } {
  const c = (value ?? {}) as Partial<{ title: string; seeAllLabel: string }>;
  return {
    title: asText(c.title, 'Top organizers near you'),
    seeAllLabel: asText(c.seeAllLabel, 'See all'),
  };
}

/** Anything → a finite integer clamped into [min, max]. */
function asInt(value: unknown, min: number, max: number, fallback = min): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(max, Math.max(min, n));
}

/**
 * The ongoing booking behind Home's "BOOKED" card.
 *
 * Unlike the CMS sections this is live transactional data, but it still deserves
 * hardening: a booking row that predates the `status` or `steps` fields, or whose
 * `progress` was put out of range by an admin edit, must not render a broken ring
 * or an impossible "-3 days to go". A record with no ref or no title is not
 * identifiable enough to open, so the card is hidden rather than half-drawn.
 */
export function safeBookedEvent(value: unknown): BookedEventData | undefined {
  const b = (value ?? {}) as Partial<BookedEventData>;
  const ref = asText(b.ref);
  const title = asText(b.title);
  if (!ref || !title) return undefined;

  return {
    id: asText(b.id),
    ref,
    title,
    description: asText(b.description),
    progress: asInt(b.progress, 0, 100, 0),
    daysToGo: asInt(b.daysToGo, 0, 36_500, 0),
    status: asEnum<BookedEventStatus>(b.status, BOOKED_STATUSES, 'confirmed'),
    // A record predating the field is treated as confirmed rather than as
    // "awaiting confirmation", which would be a scarier claim than the truth.
    organizerConfirmed: b.organizerConfirmed !== false,
    organizerName: asText(b.organizerName, 'Your organizer'),
    steps: asArray<Partial<BookedStep>>(b.steps)
      // A milestone with no label is a blank chip — drop it rather than draw it.
      .filter((s) => asText(s?.label))
      .map((s) => ({ label: asText(s.label), done: s?.done === true })),
  };
}

/** True when the record has the minimum Home cannot render without. */
export function hasUsableContent(content: HomeContent | null | undefined): boolean {
  return !!content && !!content.hero && typeof content.hero === 'object';
}

export { asArray, asText, asEnum };
