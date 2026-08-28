import {
  Utensils, Droplet, Flower2, Camera, Music, Truck, Flame, Hand, Plus,
  type LucideIcon,
} from 'lucide-react';

export interface VendorCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Unit the rate is charged in, e.g. "bottle" -> "per bottle". */
  unit: string;
}

export const VENDOR_CATEGORIES: VendorCategory[] = [
  { id: 'food', label: 'Food', icon: Utensils, unit: 'plate' },
  { id: 'water', label: 'Water', icon: Droplet, unit: 'bottle' },
  { id: 'decor', label: 'Decor', icon: Flower2, unit: 'event' },
  { id: 'photography', label: 'Photography', icon: Camera, unit: 'day' },
  { id: 'music', label: 'Music', icon: Music, unit: 'event' },
  { id: 'transport', label: 'Transport', icon: Truck, unit: 'trip' },
  { id: 'priest', label: 'Priest', icon: Flame, unit: 'ceremony' },
  { id: 'mehendi', label: 'Mehendi', icon: Hand, unit: 'hand' },
  /*
   * The escape hatch. It is a real member of the backend's SubVendorCategory
   * enum, not a client-side fiction — so organizer matching, the admin roster
   * filters and the rate-card unit all keep working, and the trade the vendor
   * types reaches admins as a request for a category Evently should add.
   */
  { id: 'other', label: 'Something else', icon: Plus, unit: 'job' },
];

/** The id of the escape-hatch category, in one place. */
export const OTHER_CATEGORY_ID = 'other';

/**
 * The sign-up gate's copy.
 *
 * `steps` mirrors the headings the three wizard screens actually render
 * (DetailsStep / RateStep / LinkStep), so the preview beside the form can't
 * promise a flow that doesn't exist. No verification SLA is quoted: unlike
 * organizers, sub-vendors are not put through an admin review gate, so there
 * is no waiting period to promise.
 */
export const SUBVENDOR_GATE = {
  points: [
    'Free to join — no listing fee, no subscription',
    'Work comes from organizers running real, booked events',
    'Set your own rate card and change it whenever you like',
  ],
  steps: ['Your details', 'Your rate card', 'Link your organizers'],
} as const;

/** Ordered wizard steps. Dot 0 represents the already-completed account step. */
export const SUBVENDOR_STEPS = ['details', 'rate', 'link'] as const;
export type SubvendorStep = (typeof SUBVENDOR_STEPS)[number];
