/**
 * Mirrors the backend's SubVendorCategory. 'other' is a real member of that
 * enum for trades Evently has no category for yet — the vendor's own words
 * live on `customCategory`, so this map is only the fallback label.
 */
export const CATEGORY_LABEL: Record<string, string> = {
  food: 'Food',
  water: 'Water',
  decor: 'Decor',
  photography: 'Photography',
  music: 'Music',
  transport: 'Transport',
  priest: 'Priest',
  mehendi: 'Mehendi',
  other: 'Something else',
};

/** What to show as this vendor's trade — their words win for 'other'. */
export function categoryLabelOf(profile: { category: string; customCategory?: string }): string {
  if (profile.category === 'other' && profile.customCategory?.trim()) {
    return profile.customCategory.trim();
  }
  return CATEGORY_LABEL[profile.category] ?? profile.category;
}
