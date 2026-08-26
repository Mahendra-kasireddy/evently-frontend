/**
 * Zones the organizer can pick for an event.
 *
 * A short, curated list rather than the runtime's full ~600: an Evently
 * organizer is running an event in a place, not administering a server, and
 * India plus the corridors families actually travel for weddings covers it.
 * Every entry is a real IANA name, which is what the backend validates
 * against — so adding one here cannot produce a zone the API will reject.
 */
export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

export const TIMEZONES: readonly string[] = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Kathmandu',
  'Asia/Colombo',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Toronto',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
  'UTC',
];
