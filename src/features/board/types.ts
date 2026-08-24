/**
 * The ideas & planning board, shared by both sides of one booking.
 *
 * The customer posts what they want, the organizer turns each post into a plan
 * and records what they understood the event to be. Both screens read the same
 * `/idea` payload, so the shape lives here rather than in either feature.
 */

export type IdeaType = 'idea' | 'surprise' | 'question' | 'inspiration' | 'update';
export type IdeaAuthorRole = 'customer' | 'organizer';
export type IdeaPlanStatus = 'planned' | 'in_progress' | 'done';
export type IdeaApproval = 'none' | 'pending' | 'approved';

export interface IdeaImage {
  url: string;
  key: string;
  originalName: string;
}

export interface IdeaReply {
  status: IdeaPlanStatus;
  text: string;
  at?: string | null;
}

export interface Idea {
  id: string;
  bookingId: string;
  authorRole: IdeaAuthorRole;
  authorName: string;
  type: IdeaType;
  text: string;
  images: IdeaImage[];
  confidential: boolean;
  reply: IdeaReply | null;
  approval: IdeaApproval;
  approvalLabel: string;
  approvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Counted server-side from the posts themselves — never stored. */
export interface IdeaCounts {
  /** Posts the customer contributed, not organizer status notes. */
  shared: number;
  /** Posts the organizer has replied to with a plan. */
  planned: number;
  awaitingApproval: number;
}

/** The organizer's short summary of the event, read back by the customer. */
export interface BoardVision {
  theme: string;
  vibe: string;
  surprise: string;
  food: string;
  surpriseConfidential: boolean;
  /** False until the organizer has filled in at least one slot. */
  captured: boolean;
}

export interface IdeaBoard {
  items: Idea[];
  counts: IdeaCounts;
  vision: BoardVision;
}

/** Which slice of the feed is showing. */
export type BoardFilter = 'all' | 'ideas' | 'inspiration' | 'surprises' | 'awaiting';

/** What a composer submits. */
export interface DraftPost {
  text: string;
  type: IdeaType;
  confidential: boolean;
  images: IdeaImage[];
}
