/**
 * Tiny className joiner — filters falsy values so conditional classes stay
 * readable: cn('btn', isActive && 'btn--active'). Pure, no deps.
 * (Swap for clsx/tailwind-merge if class conflict resolution becomes a need.)
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
