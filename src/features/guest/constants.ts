/** Copy for the guest's own screen — the only surface a non-user ever sees. */
export const GUEST_PAGE_COPY = {
  loading: 'Opening your invitation…',
  errorTitle: 'This invitation isn’t available',
  errorBody:
    'The link may have expired, or the invitation may have been taken down. Ask whoever sent it for a fresh link.',
  greeting: (name: string) => `Hi ${name} — you’re invited`,
  greetingAnon: 'You’re invited',
  jumpedTo: (section: string) => `Shared with you: ${section}`,
  seeAll: 'See the full invitation',
  brand: 'Evently',
} as const;
