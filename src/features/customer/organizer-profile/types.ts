export type ProfileTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export interface ProfileStat { value: string; label: string }
export interface ProfileTile { id: string; color: string; image?: string }
export interface ProfileReview { id: string; initials: string; avatarColor: string; name: string; meta: string; rating: number; text: string; reply?: string }
export interface OrganizerProfile {
  id: string;
  initials: string;
  name: string;
  avatarColor: string;
  tier: ProfileTier;
  rating: number;
  reviews: number;
  location: string;
  certified: boolean;
  stats: ProfileStat[];
  about: string;
  serviceArea: string;
  portfolio: ProfileTile[];
  reviewsList: ProfileReview[];
  estLabel: string;
  estRange: string;
}
