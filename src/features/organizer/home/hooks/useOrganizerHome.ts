import {
  useGetOrganizerBadgesQuery,
  useGetOrganizerDashboardQuery,
  useUpdateBookingTaskMutation,
} from '@features/organizer/bookings/service';
import type { BadgeStatus, OrganizerDashboard } from '../types';

export interface UseOrganizerHomeResult {
  data: OrganizerDashboard | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  toggleTask: (bookingId: string, taskId: string, done: boolean) => void;
  badges: BadgeStatus | undefined;
}

/** Organizer home summary — real stats/tasks/schedule from the booking module. */
export function useOrganizerHome(): UseOrganizerHomeResult {
  const { data, isLoading, isError, refetch } = useGetOrganizerDashboardQuery();
  const [updateTask] = useUpdateBookingTaskMutation();
  // Same cached query the Badges & tiers page uses — shares one request, no extra load.
  const { data: badges } = useGetOrganizerBadgesQuery();

  const toggleTask = (bookingId: string, taskId: string, done: boolean) => {
    void updateTask({ bookingId, taskId, status: done ? 'done' : 'todo' });
  };

  return { data, isLoading, isError, refetch, toggleTask, badges };
}
