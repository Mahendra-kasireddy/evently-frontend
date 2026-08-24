export type BookingTaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskAssignmentStatus = 'unassigned' | 'pending' | 'accepted' | 'declined';

export interface TaskProofFile {
  url: string;
  key: string;
  originalName: string;
}

export interface TaskOrganizerRef {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
}

/** One row of GET /booking/subvendor/mine. */
export interface ApiSubVendorTask {
  id: string;
  bookingId: string;
  bookingRef: string;
  bookingTitle: string;
  eventDate: string;
  location: string;
  organizer: TaskOrganizerRef | null;
  title: string;
  status: BookingTaskStatus;
  assignmentStatus: TaskAssignmentStatus;
  amount: number;
  dueDate: string | null;
  photoProof: TaskProofFile | null;
}
