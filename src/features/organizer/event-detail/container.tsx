import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { LoadingScreen, ErrorState, EmptyState } from '@shared/components';
import { useEventDetail } from './hooks/useEventDetail';
import { useGetOrganizerIdeasQuery } from '@features/organizer/ideas/service';
import { Component } from './Component';

export interface EventDetailContainerProps {
  bookingId: string;
}

export function EventDetailContainer({ bookingId }: EventDetailContainerProps) {
  const navigate = useNavigate();
  const {
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
    isAddingTask,
    moveTask,
    removeTask,
    assignTask,
    uploadProofForTask,
    markCompleted,
    isCompleting,
    declineReason,
    setDeclineReason,
    acceptBooking,
    declineBooking,
    isResponding,
  } = useEventDetail(bookingId);
  // Same cache entry the board screen uses, so replying there updates these.
  const { data: ideaBoard } = useGetOrganizerIdeasQuery(bookingId, { skip: !bookingId });

  if (isLoading) return <LoadingScreen message="Loading event…" />;
  if (isError) {
    return (
      <ErrorState message="We couldn't load this event. Please check your connection and try again." onRetry={refetch} />
    );
  }
  if (!booking) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 20px' }}>
        <EmptyState
          icon={FileQuestion}
          title="Event not found"
          message="This booking may have been removed or is no longer visible to you."
          actionLabel="Back to events"
          onAction={() => navigate('/organizer/events')}
        />
      </div>
    );
  }

  return (
    <Component
      booking={booking}
      subvendors={subvendors}
      newTaskTitle={newTaskTitle}
      setNewTaskTitle={setNewTaskTitle}
      newTaskSubVendorId={newTaskSubVendorId}
      setNewTaskSubVendorId={setNewTaskSubVendorId}
      newTaskAmount={newTaskAmount}
      setNewTaskAmount={setNewTaskAmount}
      onAddTask={() => void addTask()}
      isAddingTask={isAddingTask}
      onMoveTask={moveTask}
      onRemoveTask={removeTask}
      ideaCounts={ideaBoard?.counts ?? { shared: 0, planned: 0, awaitingApproval: 0 }}
      onOpenIdeaBoard={() => navigate(`/organizer/events/${bookingId}/ideas`)}
      onAssignTask={assignTask}
      onUploadProof={(taskId, file) => void uploadProofForTask(taskId, file)}
      onMarkCompleted={markCompleted}
      isCompleting={isCompleting}
      declineReason={declineReason}
      setDeclineReason={setDeclineReason}
      onAcceptBooking={acceptBooking}
      onDeclineBooking={() => void declineBooking()}
      isResponding={isResponding}
    />
  );
}
