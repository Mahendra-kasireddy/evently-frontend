import type { FileRef, Option, OrganizerProfile } from '@features/onboarding/organizer/types';

export type { FileRef, Option, OrganizerProfile };

/**
 * The owner's own copy of the public profile, exactly as a customer receives it
 * (`GET /organizer/profile/preview`). `isLive` is false while the profile is
 * still awaiting admin approval, so it is not discoverable yet.
 */
export interface OrganizerPublicPreview {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  tier: string;
  rating: number;
  reviews: number;
  events: number;
  tags: string[];
  location: string;
  city: string;
  businessName: string;
  displayName: string;
  primaryCategory: string;
  tagline: string;
  businessDescription: string;
  secondaryCategories: string[];
  servicesOffered: string[];
  profilePhoto: FileRef | null;
  coverPhoto: FileRef | null;
  gallery: FileRef[];
  isLive: boolean;
}

/** The editable fields on this screen (a subset of the full profile). */
export interface ProfileEditForm {
  businessName: string;
  displayName: string;
  tagline: string;
  businessDescription: string;
  secondaryCategories: string[];
}

export type ProfileEditErrors = Partial<Record<keyof ProfileEditForm, string>>;

/** Which upload slot a pending file belongs to. */
export type UploadSlot = 'profilePhoto' | 'gallery';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';
