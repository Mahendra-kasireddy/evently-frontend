import { useGetMyTasksQuery, useRespondToTaskMutation } from '@features/subvendor/tasks/service';
import { useGetMyPerformanceQuery } from '@features/subvendor/payments/service';
import { RECENT_DONE_LIMIT } from '../constants';

export function useSubvendorHome() {
  const { data: tasks = [], isLoading, isError, refetch } = useGetMyTasksQuery();
  const { data: performance } = useGetMyPerformanceQuery();
  const [respond, respondState] = useRespondToTaskMutation();

  const pending = tasks.filter((t) => t.assignmentStatus === 'pending');
  const active = tasks.filter((t) => t.assignmentStatus === 'accepted' && t.status !== 'done');

  /*
   * Finished work, newest event first. It used to be counted and thrown away;
   * a vendor had no way to look back at what they had delivered.
   */
  const done = tasks
    .filter((t) => t.assignmentStatus === 'accepted' && t.status === 'done')
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

  const now = new Date();
  const completedThisMonth = done.filter((t) => {
    const d = new Date(t.eventDate);
    return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
  });

  return {
    isLoading,
    isError,
    refetch,
    pending,
    active,
    done: done.slice(0, RECENT_DONE_LIMIT),
    doneTotal: done.length,
    completedCount: completedThisMonth.length,
    earnedThisMonth: performance?.thisMonthEarned ?? 0,
    respond: (bookingId: string, taskId: string, accept: boolean) =>
      void respond({ bookingId, taskId, accept }),
    isResponding: respondState.isLoading,
    respondError: respondState.error ? 'We couldn’t send your answer. Please try again.' : null,
  };
}
