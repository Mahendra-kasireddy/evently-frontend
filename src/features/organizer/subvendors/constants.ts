export const CATEGORY_LABEL: Record<string, string> = {
  food: 'Food',
  water: 'Water',
  decor: 'Decor',
  photography: 'Photography',
  music: 'Music',
  transport: 'Transport',
  priest: 'Priest',
  mehendi: 'Mehendi',
};

export const SUBVENDORS_COPY = {
  title: 'My sub-vendors',
  allCategories: 'All categories',
  invite: 'Invite sub-vendor',
  invitePlaceholder: '10-digit mobile number',
  sendInvite: 'Send invite',
  cancel: 'Cancel',
  pendingTitle: 'Pending invites',
  resend: 'Resend',
  resendUnavailable:
    'Invites resolve automatically when that number signs up — there is no SMS provider wired up to resend to.',
  messageUnavailable: 'Sub-vendor messaging isn’t available yet — the chat module is not wired up.',
  remove: 'Remove sub-vendor',
  cancelInvite: 'Cancel invite',
  emptyTitle: 'No sub-vendors yet',
  emptyBody: 'Invite one by mobile number and they will appear here once they sign up.',
  emptyFilteredTitle: 'None in this category',
  emptyFilteredBody: 'Switch back to all categories to see the rest of your roster.',
  columns: {
    name: 'Name',
    category: 'Category',
    area: 'Area',
    rate: 'Base rate',
    performance: 'Performance',
    events: 'Events',
    status: 'Status',
  },
} as const;

/**
 * Displays an invited number as `+91 90000 11223`. The API stores a bare
 * 10-digit mobile, but older links may already carry a prefix or spacing, so
 * the value is normalised first rather than blindly prefixed.
 */
export function formatInvitedPhone(raw: string | null): string {
  if (!raw) return '—';
  const digits = raw.replace(/\D/g, '');
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  if (local.length !== 10) return raw.trim();
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
}

/**
 * Performance gauge colour, matching the reference design's thresholds.
 * Expressed with the shared partner tokens rather than raw hex.
 */
export function performanceColor(value: number): string {
  if (value >= 85) return 'var(--c-teal)';
  if (value >= 70) return 'var(--c-amber)';
  return 'var(--c-red)';
}
