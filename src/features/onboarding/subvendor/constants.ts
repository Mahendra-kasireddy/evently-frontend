import { Utensils, Droplet, Flower2, Camera, Music, Truck, Flame, Hand, type LucideIcon } from 'lucide-react';

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
];

/** Ordered wizard steps. Dot 0 represents the already-completed account step. */
export const SUBVENDOR_STEPS = ['details', 'rate', 'link'] as const;
export type SubvendorStep = (typeof SUBVENDOR_STEPS)[number];
