import { useParams } from 'react-router-dom';
import { TaskDetailContainer } from './container';

export function TaskDetailPage() {
  const { bookingId, taskId } = useParams<{ bookingId: string; taskId: string }>();
  if (!bookingId || !taskId) return null;
  return <TaskDetailContainer bookingId={bookingId} taskId={taskId} />;
}

export default TaskDetailPage;
