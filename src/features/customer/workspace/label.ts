const OCCASION_LABEL: Record<string, string> = {
  wedding: 'Wedding',
  birthday: 'Birthday',
  housewarming: 'Housewarming',
  naming: 'Naming ceremony',
  anniversary: 'Anniversary',
  corporate: 'Corporate event',
};

/** "Wedding" from either a stored key ("wedding") or a display string. */
export function occasionLabel(key: string | undefined): string {
  const k = (key ?? '').trim();
  if (!k) return 'Event';
  return OCCASION_LABEL[k.toLowerCase()] ?? k.charAt(0).toUpperCase() + k.slice(1);
}

/**
 * How one event is named everywhere inside My Events — the card heading, the
 * breadcrumb, the page it opens. Occasion plus date when there is one, so the
 * customer with two weddings can tell which is which. Kept in one place so those
 * three never drift apart.
 */
export function eventLabel(request: { occasion?: string; when?: string }): string {
  const occasion = occasionLabel(request.occasion);
  const when = (request.when ?? '').trim();
  return when ? `${occasion} · ${when}` : occasion;
}
