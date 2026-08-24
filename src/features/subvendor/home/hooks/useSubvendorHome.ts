import { useGetMyTasksQuery, useRespondToTaskMutation } from '@features/subvendor/tasks/service';
import { useGetMyPerformanceQuery } from '@features/subvendor/payments/service';

export function useSubvendorHome() {
  const { data: tasks = [], isLoading, isError, refetch } = useGetMyTasksQuery();
  const { data: performance } = useGetMyPerformanceQuery();
  const [respond, respondState] = useRespondToTaskMutation();

  const pending = tasks.filter((t) => t.assignmentStatus === 'pending');
  const active = tasks.filter((t) => t.assignmentStatus === 'accepted' && t.status !== 'done');
  const now = new Date();
  const completedThisMonth = tasks.filter((t) => {
    if (t.status !== 'done') return false;
    const d = new Date(t.eventDate);
    return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
  });

  return {
    isLoading,
    isError,
    refetch,
    pending,
    active,
    completedCount: completedThisMonth.length,
    earnedThisMonth: performance?.thisMonthEarned ?? 0,
    respond: (bookingId: string, taskId: string, accept: boolean) =>
      void respond({ bookingId, taskId, accept }),
    isResponding: respondState.isLoading,
  };
}
