/**
 * Domain types for the Landing feature. Strongly typed, no `any`.
 * These mirror the shape the backend is expected to return, so swapping the
 * mock services for real API calls requires no component changes.
 */

export type CelebrationCategorySlug =
  | 'weddings'
  | 'birthdays'
  | 'housewarming'
  | 'naming'
  | 'anniversaries'
  | 'corporate';

export interface Category {
  id: string;
  slug: CelebrationCategorySlug;
  title: string;
  subtitle: string;
  /** Icon key resolved to a Lucide icon in the UI layer. */
  icon: IconKey;
  imageUrl: string;
}

export interface HowItWorksStep {
  id: string;
  order: number;
  title: string;
  description: string;
  /** Pill label under the step (e.g. "Transparent pricing"). */
  tag: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: IconKey;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export type IconKey =
  | 'heart'
  | 'gift'
  | 'home'
  | 'sparkles'
  | 'rings'
  | 'briefcase'
  | 'users'
  | 'file-text'
  | 'shield-check'
  | 'eye'
  | 'calendar'
  | 'star'
  | 'trending-up'
  | 'badge-check';

/** Async result envelope used by hooks for loading/error/empty handling. */
export interface AsyncState<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
}
