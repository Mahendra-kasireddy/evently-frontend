export interface SubVendorRef {
  id: string;
  fullName: string;
  initials: string;
  avatarColor: string;
  category: string;
  serviceArea: string;
  baseRate: number;
  baseRateUnit: string;
  /** The sub-vendor's own availability, independent of the link status. */
  active: boolean;
}

export type SubVendorLinkStatus = 'pending' | 'active' | 'removed';

export interface ApiSubVendorLink {
  linkId: string;
  status: SubVendorLinkStatus;
  invitedPhone: string | null;
  /** ISO timestamp of when the invite was created. Null on legacy links. */
  invitedAt: string | null;
  rating: number;
  subVendor: SubVendorRef | null;
  eventsCount: number;
  performancePercent: number;
}
