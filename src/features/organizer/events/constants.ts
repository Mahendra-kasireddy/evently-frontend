export const EVENTS_COPY = {
  title: 'Active events',
  subtitleActive: (n: number) => `${n} ${n === 1 ? 'event is' : 'events are'} in progress.`,
  subtitleEmpty: "You don't have any active bookings yet.",
  awaitingTitle: 'Needs your confirmation',
  awaitingSubtitle: (n: number) =>
    `${n} paid ${n === 1 ? 'booking is' : 'bookings are'} waiting on you to accept or decline.`,
};
