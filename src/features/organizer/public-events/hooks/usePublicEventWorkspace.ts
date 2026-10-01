import { useState } from 'react';
import {
  useArchiveTicketTypeMutation,
  useCheckInTicketMutation,
  useCreateTicketTypeMutation,
  useGetAttendeesQuery,
  useGetEventDashboardQuery,
  useGetPublicEventQuery,
  useGetTicketTypesQuery,
  useSetEventLiveStreamMutation,
  useSetEventMemoriesMutation,
  useSetPublicEventStatusMutation,
  useUpdatePublicEventMutation,
  useUpdateTicketTypeMutation,
} from '../service';
import type {
  CheckInOutcome,
  EventLiveSettings,
  EventMemoriesSettings,
  PublicEventInput,
  PublicEventStatus,
  TicketTypeInput,
} from '../types';

const sentence = (error: unknown, fallback: string): string =>
  (error as { message?: string } | undefined)?.message ?? fallback;

/**
 * One event's workspace: everything the organizer does to it after it exists.
 *
 * All of it hangs off the event id from the route, and every mutation here
 * invalidates by that id, so a ticket type added on the Tickets tab moves the
 * numbers on the Dashboard tab without either of them knowing about the other.
 */
export function usePublicEventWorkspace(eventId: string) {
  const [attendeeFilter, setAttendeeFilter] = useState<'all' | 'checked_in' | 'pending'>('all');
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [lastScan, setLastScan] = useState<CheckInOutcome | null>(null);

  const detail = useGetPublicEventQuery(eventId);
  const dashboard = useGetEventDashboardQuery(eventId);
  const ticketTypes = useGetTicketTypesQuery(eventId);
  const attendees = useGetAttendeesQuery({
    eventId,
    checkIn: attendeeFilter,
    q: attendeeSearch || undefined,
  });

  const [updateEvent, updating] = useUpdatePublicEventMutation();
  const [setStatus, statusState] = useSetPublicEventStatusMutation();
  const [createType, creatingType] = useCreateTicketTypeMutation();
  const [updateType, updatingType] = useUpdateTicketTypeMutation();
  const [archiveType] = useArchiveTicketTypeMutation();
  const [checkIn, scanning] = useCheckInTicketMutation();
  const [saveMemories, savingMemories] = useSetEventMemoriesMutation();
  const [saveLive, savingLive] = useSetEventLiveStreamMutation();

  return {
    event: detail.data?.event ?? null,
    dashboard: dashboard.data ?? null,
    ticketTypes: ticketTypes.data ?? [],
    attendees: attendees.data?.items ?? [],
    attendeeTotal: attendees.data?.total ?? 0,

    isLoading: detail.isLoading,
    isError: detail.isError,
    loadError: detail.error ?? null,
    refetch: () => {
      void detail.refetch();
      void dashboard.refetch();
      void ticketTypes.refetch();
      void attendees.refetch();
    },

    attendeeFilter,
    setAttendeeFilter,
    attendeeSearch,
    setAttendeeSearch,
    attendeesLoading: attendees.isFetching,

    saveEvent: (body: Partial<PublicEventInput>) =>
      updateEvent({ eventId, body }).unwrap(),
    isSavingEvent: updating.isLoading,
    saveEventError: updating.error
      ? sentence(updating.error, 'Those changes could not be saved.')
      : null,

    changeStatus: (status: PublicEventStatus, reason?: string) =>
      setStatus({ eventId, status, reason }).unwrap(),
    isChangingStatus: statusState.isLoading,
    statusError: statusState.error
      ? sentence(statusState.error, 'That status could not be changed.')
      : null,

    addTicketType: (body: TicketTypeInput) => createType({ eventId, body }).unwrap(),
    editTicketType: (typeId: string, body: Partial<TicketTypeInput>) =>
      updateType({ eventId, typeId, body }).unwrap(),
    removeTicketType: (typeId: string) => archiveType({ eventId, typeId }).unwrap(),
    isSavingTicket: creatingType.isLoading || updatingType.isLoading,
    ticketError:
      creatingType.error || updatingType.error
        ? sentence(
            creatingType.error ?? updatingType.error,
            'That ticket type could not be saved.',
          )
        : null,

    /* The scanner is a camera; the server is the authority. Whatever it says
       is what the door is shown, including its refusals. */
    scan: async (payload: { qrToken?: string; code?: string }) => {
      const outcome = await checkIn({ eventId, ...payload }).unwrap();
      setLastScan(outcome);
      return outcome;
    },
    lastScan,
    clearScan: () => setLastScan(null),
    isScanning: scanning.isLoading,

    saveMemories: (body: Partial<EventMemoriesSettings>) =>
      saveMemories({ eventId, body }).unwrap(),
    isSavingMemories: savingMemories.isLoading,

    saveLiveStream: (body: Partial<EventLiveSettings>) => saveLive({ eventId, body }).unwrap(),
    isSavingLive: savingLive.isLoading,
    liveError: savingLive.error
      ? sentence(savingLive.error, 'Those stream settings could not be saved.')
      : null,
  };
}
