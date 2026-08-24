import { useState } from 'react';
import {
  useGetOrganizerBookingQuery,
  useAddBookingTaskMutation,
  useUpdateBookingTaskMutation,
  useRemoveBookingTaskMutation,
  useUpdateOrganizerBookingStatusMutation,
  useUploadTaskProofMutation,
} from '@features/organizer/bookings/service';
import { useGetMySubvendorsQuery } from '@features/organizer/subvendors/service';
import type { BookingTaskStatus } from '../types';

export function useEventDetail(bookingId: string) {
  const { data: booking, isLoading, isError, refetch } = useGetOrganizerBookingQuery(bookingId);
  const { data: subvendorLinks = [] } = useGetMySubvendorsQuery();
  const [addTaskMutation, addState] = useAddBookingTaskMutation();
  const [updateTaskMutation] = useUpdateBookingTaskMutation();
  const [removeTaskMutation] = useRemoveBookingTaskMutation();
  const [updateStatusMutation, statusState] = useUpdateOrganizerBookingStatusMutation();
  const [uploadProof] = useUploadTaskProofMutation();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubVendorId, setNewTaskSubVendorId] = useState('');
  const [newTaskAmount, setNewTaskAmount] = useState('');

  const subvendors = subvendorLinks
    .filter((l) => l.status === 'active' && l.subVendor)
    .map((l) => ({ id: l.subVendor!.id, fullName: l.subVendor!.fullName }));

  const addTask = async () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    await addTaskMutation({
      bookingId,
      title,
      ...(newTaskSubVendorId ? { subVendorId: newTaskSubVendorId } : {}),
      ...(newTaskAmount ? { amount: Number(newTaskAmount) } : {}),
    }).unwrap();
    setNewTaskTitle('');
    setNewTaskSubVendorId('');
    setNewTaskAmount('');
  };

  const moveTask = (taskId: string, status: BookingTaskStatus) => {
    void updateTaskMutation({ bookingId, taskId, status });
  };

  const removeTask = (taskId: string) => {
    void removeTaskMutation({ bookingId, taskId });
  };

  /**
   * Assign or clear a sub-vendor on an existing task — the design's "+ Assign"
   * affordance. Reuses the same PATCH the create form relies on; `null` clears
   * the assignment, which the backend DTO explicitly allows.
   */
  const assignTask = (taskId: string, subVendorId: string | null) => {
    void updateTaskMutation({ bookingId, taskId, subVendorId });
  };

  const uploadProofForTask = async (taskId: string, file: File) => {
    const photoProof = await uploadProof({ file }).unwrap();
    await updateTaskMutation({ bookingId, taskId, photoProof }).unwrap();
  };

  const markCompleted = () => {
    void updateStatusMutation({ id: bookingId, status: 'completed' });
  };

  return {
    booking,
    isLoading,
    isError,
    refetch,
    subvendors,
    newTaskTitle,
    setNewTaskTitle,
    newTaskSubVendorId,
    setNewTaskSubVendorId,
    newTaskAmount,
    setNewTaskAmount,
    addTask,
    isAddingTask: addState.isLoading,
    moveTask,
    removeTask,
    assignTask,
    uploadProofForTask,
    markCompleted,
    isCompleting: statusState.isLoading,
  };
}
