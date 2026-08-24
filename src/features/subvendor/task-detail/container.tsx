import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { LoadingScreen, ErrorState, EmptyState } from '@shared/components';
import { useTaskDetail } from './hooks/useTaskDetail';
import { Component } from './Component';

export interface TaskDetailContainerProps {
  bookingId: string;
  taskId: string;
}

export function TaskDetailContainer({ bookingId, taskId }: TaskDetailContainerProps) {
  const navigate = useNavigate();
  const {
    task,
    isLoading,
    isError,
    refetch,
    accept,
    decline,
    start,
    markDone,
    uploadPhoto,
    isResponding,
    isUpdating,
    isUploading,
  } = useTaskDetail(bookingId, taskId);

  if (isLoading) return <LoadingScreen message="Loading task…" />;
  if (isError) {
    return (
      <ErrorState message="We couldn't load this task. Please check your connection and try again." onRetry={refetch} />
    );
  }
  if (!task) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 20px' }}>
        <EmptyState
          icon={FileQuestion}
          title="Task not found"
          message="This task may have been removed or reassigned."
          actionLabel="Back to tasks"
          onAction={() => navigate('/subvendor/home')}
        />
      </div>
    );
  }

  return (
    <Component
      task={task}
      onAccept={() => void accept()}
      onDecline={() => void decline().then(() => navigate('/subvendor/home'))}
      onStart={() => void start()}
      onMarkDone={() => void markDone()}
      onUploadPhoto={(file) => void uploadPhoto(file)}
      isResponding={isResponding}
      isUpdating={isUpdating}
      isUploading={isUploading}
    />
  );
}
