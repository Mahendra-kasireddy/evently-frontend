export interface RoleStat { label: string; value: string; }
export type RoleTone = 'organizer' | 'subvendor';

export interface JoinRole {
  to: string;
  id: RoleTone;
  tone: RoleTone;
  icon: 'briefcase' | 'truck';
  title: string;
  description: string;
  cta: string;
  badge: string;
  stats: RoleStat[];
}
export interface City { id: string; name: string }
