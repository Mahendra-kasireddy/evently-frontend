import {
  useGetMyTasksQuery,
  useRespondToTaskMutation,
  useUpdateOwnTaskMutation,
  useUploadSubvendorTaskProofMutation,
} from '@features/subvendor/tasks/service';

export function useTaskDetail(bookingId: string, taskId: string) {
  const { data: tasks = [], isLoading, isError, refetch } = useGetMyTasksQuery();
  const task = tasks.find((t) => t.bookingId === bookingId && t.id === taskId) ?? null;

  const [respond, respondState] = useRespondToTaskMutation();
  const [updateTask, updateState] = useUpdateOwnTaskMutation();
  const [uploadProof, uploadState] = useUploadSubvendorTaskProofMutation();

  const accept = () => respond({ bookingId, taskId, accept: true });
  const decline = () => respond({ bookingId, taskId, accept: false });
  const start = () => updateTask({ bookingId, taskId, status: 'in_progress' });
  const markDone = () => updateTask({ bookingId, taskId, status: 'done' });
  const uploadPhoto = async (file: File) => {
    const photoProof = await uploadProof({ file }).unwrap();
    await updateTask({ bookingId, taskId, photoProof }).unwrap();
  };

  return {
    task,
    isLoading,
    isError,
    refetch,
    accept,
    decline,
    start,
    markDone,
    uploadPhoto,
    isResponding: respondState.isLoading,
    isUpdating: updateState.isLoading,
    isUploading: uploadState.isLoading,
  };
}
