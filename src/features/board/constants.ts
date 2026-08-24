import {
  Gift,
  HelpCircle,
  Image as ImageIcon,
  Megaphone,
  Sparkles,
  Heart,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import type { BoardFilter, Idea, IdeaPlanStatus, IdeaType } from './types';

/** Post type → its chip. `cls` names a class in the shared board stylesheet. */
export const TYPE_META: Record<IdeaType, { label: string; icon: LucideIcon; cls: string }> = {
  idea: { label: 'Idea', icon: Sparkles, cls: 'tIdea' },
  inspiration: { label: 'Inspiration', icon: ImageIcon, cls: 'tInsp' },
  question: { label: 'Question', icon: HelpCircle, cls: 'tQuestion' },
  surprise: { label: 'Surprise', icon: Gift, cls: 'tSurprise' },
  update: { label: 'Update', icon: Megaphone, cls: 'tUpdate' },
};

export const STATUS_META: Record<IdeaPlanStatus, { label: string; cls: string }> = {
  planned: { label: 'Planned', cls: 'sPlanned' },
  in_progress: { label: 'In progress', cls: 'sProgress' },
  done: { label: 'Done', cls: 'sDone' },
};

/** What each side may post. The rest of the types belong to the other role. */
export const CUSTOMER_TYPES: IdeaType[] = ['idea', 'inspiration', 'question', 'surprise'];
export const ORGANIZER_TYPES: IdeaType[] = ['update', 'question'];

export const FILTERS: { value: BoardFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ideas', label: 'Ideas' },
  { value: 'inspiration', label: 'Inspiration' },
  { value: 'surprises', label: 'Surprises' },
  { value: 'awaiting', label: 'Awaiting approval' },
];

/** The four vision slots, in the order the design shows them. */
export const VISION_SLOTS: {
  key: 'theme' | 'vibe' | 'surprise' | 'food';
  label: string;
  icon: LucideIcon;
}[] = [
  { key: 'theme', label: 'THEME', icon: Sparkles },
  { key: 'vibe', label: 'VIBE', icon: Heart },
  { key: 'surprise', label: 'SURPRISE', icon: Gift },
  { key: 'food', label: 'FOOD', icon: Utensils },
];

/** Does this post belong in the given filter? */
export function matchesFilter(idea: Idea, filter: BoardFilter): boolean {
  switch (filter) {
    case 'ideas':
      return idea.type === 'idea';
    case 'inspiration':
      return idea.type === 'inspiration';
    case 'surprises':
      return idea.type === 'surprise';
    case 'awaiting':
      return idea.approval === 'pending';
    default:
      return true;
  }
}

/** Relative age of a post, in the design's shorthand. */
export function when(iso?: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return '';
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

/** `2026-12-28T…` → `28 Dec`. */
export function shortDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Two-letter monogram for an avatar, from whatever name we actually have. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '·';
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + second).toUpperCase();
}

/**
 * Share of the customer's ideas the organizer has turned into a plan. Zero
 * ideas means zero percent, not a division by zero.
 */
export function plannedPercent(planned: number, shared: number): number {
  if (shared <= 0) return 0;
  return Math.min(100, Math.round((planned / shared) * 100));
}
