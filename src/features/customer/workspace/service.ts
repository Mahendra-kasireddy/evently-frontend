import { baseApi } from '@lib/rtk';
import type { WorkspaceData } from './types';

const data: WorkspaceData = {
  progress: 72,
  eyebrow: 'YOUR WEDDING WORKSPACE',
  heading: '14 days away',
  subline: '28 May 2026 · Banjara Hills, Hyderabad',
  countdown: { days: '14', hrs: '06', min: '22' },
  ideas: { title: 'Share your ideas with Sharma Events', meta: '12 ideas shared · 8 planned · 3 awaiting your approval', cta: 'Open' },
  invitation: { title: 'Your invitation is ready to review', meta: 'Sharma Events prepared it · awaiting your approval', cta: 'Review' },
  categories: [
    { id: 'catering', name: 'Catering', status: 'On track', subVendor: 'Ramesh Caterers', desc: 'Menu confirmed. Cooking starts the day before.' },
    { id: 'decoration', name: 'Decoration', status: 'In progress', subVendor: 'Bloom Decor', desc: 'Theme approved, awaiting flower delivery.' },
    { id: 'photography', name: 'Photography', status: 'On track', subVendor: 'Lens & Co', desc: 'Team briefed. Pre-wedding shoot done.' },
    { id: 'priest', name: 'Priest', status: 'Action needed', subVendor: 'Pandit Sharma', desc: 'Muhurtham time to be reconfirmed by family.' },
  ],
  organizer: { initials: 'SE', name: 'Sharma Events', note: 'Managing your event · you review & approve', color: '#7c5bd6' },
  familyTitle: 'Family co-planning',
  family: [{ initials: 'RR', color: '#1d9e75' }, { initials: 'SR', color: '#e8633a' }, { initials: 'KR', color: '#1a2e5a' }],
  timelineTitle: 'Event-day timeline',
  timeline: [
    { time: '8:00 AM', label: 'Water delivery · 400 bottles', done: true },
    { time: '10:00 AM', label: 'Decoration setup begins', done: false },
    { time: '12:00 PM', label: 'Catering arrives', done: false },
    { time: '4:00 PM', label: 'Photography team on-site', done: false },
    { time: '6:00 PM', label: 'Muhurtham', done: false },
  ],
};

export async function fetchWorkspace(): Promise<WorkspaceData> {
  await new Promise((r) => setTimeout(r, 200));
  return data;
}

export const workspaceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({ getWorkspace: build.query<WorkspaceData, void>({ queryFn: async () => ({ data: await fetchWorkspace() }) }) }),
});
export const { useGetWorkspaceQuery } = workspaceApi;
