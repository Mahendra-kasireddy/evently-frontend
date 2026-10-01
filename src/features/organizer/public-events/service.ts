import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type {
  AttendeeListArgs,
  Attendee,
  CheckInOutcome,
  EventDashboard,
  EventLiveSettings,
  EventMemoriesSettings,
  Paged,
  PublicEvent,
  PublicEventInput,
  PublicEventListArgs,
  PublicEventSummary,
  StatusChangeArgs,
  TicketType,
  TicketTypeInput,
} from './types';

/**
 * The organizer's public events.
 *
 * Every route is `/public-event/organizer/*`, which the server scopes to the
 * signed-in organizer. No request here carries an organizer id, because none of
 * these endpoints accept one — ownership is resolved from the session, and a
 * second answer supplied by the client would be the one an attacker controls.
 */
export const organizerPublicEventsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPublicEvents: build.query<Paged<PublicEventSummary>, PublicEventListArgs | void>({
      queryFn: (args) =>
        toQueryResult(async () => {
          const params: Record<string, string> = {};
          if (args && args.status) params.status = args.status;
          if (args && args.q) params.q = args.q;
          return (
            await apiClient.get<Paged<PublicEventSummary>>('/public-event/organizer', { params })
          ).data;
        }),
      providesTags: ['PublicEvents'],
    }),

    getPublicEvent: build.query<
      { event: PublicEvent; ticketTypes: TicketType[]; liveState: string },
      string
    >({
      queryFn: (eventId) =>
        toQueryResult(
          async () =>
            (
              await apiClient.get<{
                event: PublicEvent;
                ticketTypes: TicketType[];
                liveState: string;
              }>(`/public-event/organizer/${eventId}`)
            ).data,
        ),
      providesTags: (_r, _e, id) => [{ type: 'PublicEvent' as const, id }],
    }),

    createPublicEvent: build.mutation<PublicEvent, PublicEventInput>({
      queryFn: (body) =>
        toQueryResult(
          async () => (await apiClient.post<PublicEvent>('/public-event/organizer', body)).data,
        ),
      invalidatesTags: ['PublicEvents'],
    }),

    updatePublicEvent: build.mutation<
      PublicEvent,
      { eventId: string; body: Partial<PublicEventInput> }
    >({
      queryFn: ({ eventId, body }) =>
        toQueryResult(
          async () =>
            (await apiClient.patch<PublicEvent>(`/public-event/organizer/${eventId}`, body)).data,
        ),
      invalidatesTags: (_r, _e, { eventId }) => [
        'PublicEvents',
        { type: 'PublicEvent' as const, id: eventId },
      ],
    }),

    setPublicEventStatus: build.mutation<PublicEvent, StatusChangeArgs>({
      queryFn: ({ eventId, status, reason }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.patch<PublicEvent>(`/public-event/organizer/${eventId}/status`, {
                status,
                ...(reason ? { reason } : {}),
              })
            ).data,
        ),
      /* The dashboard reads the status too, so it is invalidated alongside. */
      invalidatesTags: (_r, _e, { eventId }) => [
        'PublicEvents',
        { type: 'PublicEvent' as const, id: eventId },
        { type: 'PublicEventDashboard' as const, id: eventId },
      ],
    }),

    // ----- Ticket types -----

    getTicketTypes: build.query<TicketType[], string>({
      queryFn: (eventId) =>
        toQueryResult(
          async () =>
            (await apiClient.get<TicketType[]>(`/public-event/organizer/${eventId}/ticket-types`))
              .data,
        ),
      providesTags: (_r, _e, id) => [{ type: 'PublicEventTickets' as const, id }],
    }),

    createTicketType: build.mutation<TicketType, { eventId: string; body: TicketTypeInput }>({
      queryFn: ({ eventId, body }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.post<TicketType>(
                `/public-event/organizer/${eventId}/ticket-types`,
                body,
              )
            ).data,
        ),
      invalidatesTags: (_r, _e, { eventId }) => [
        { type: 'PublicEventTickets' as const, id: eventId },
        { type: 'PublicEventDashboard' as const, id: eventId },
        { type: 'PublicEvent' as const, id: eventId },
        'PublicEvents',
      ],
    }),

    updateTicketType: build.mutation<
      TicketType,
      { eventId: string; typeId: string; body: Partial<TicketTypeInput> }
    >({
      queryFn: ({ eventId, typeId, body }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.patch<TicketType>(
                `/public-event/organizer/${eventId}/ticket-types/${typeId}`,
                body,
              )
            ).data,
        ),
      invalidatesTags: (_r, _e, { eventId }) => [
        { type: 'PublicEventTickets' as const, id: eventId },
        { type: 'PublicEventDashboard' as const, id: eventId },
        { type: 'PublicEvent' as const, id: eventId },
        'PublicEvents',
      ],
    }),

    archiveTicketType: build.mutation<
      { id: string; archived: boolean },
      { eventId: string; typeId: string }
    >({
      queryFn: ({ eventId, typeId }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.delete<{ id: string; archived: boolean }>(
                `/public-event/organizer/${eventId}/ticket-types/${typeId}`,
              )
            ).data,
        ),
      invalidatesTags: (_r, _e, { eventId }) => [
        { type: 'PublicEventTickets' as const, id: eventId },
        { type: 'PublicEventDashboard' as const, id: eventId },
        'PublicEvents',
      ],
    }),

    // ----- The dashboard, the door, who is coming -----

    getEventDashboard: build.query<EventDashboard, string>({
      queryFn: (eventId) =>
        toQueryResult(
          async () =>
            (await apiClient.get<EventDashboard>(`/public-event/organizer/${eventId}/dashboard`))
              .data,
        ),
      providesTags: (_r, _e, id) => [{ type: 'PublicEventDashboard' as const, id }],
    }),

    getAttendees: build.query<Paged<Attendee>, AttendeeListArgs>({
      queryFn: ({ eventId, checkIn, q }) =>
        toQueryResult(async () => {
          const params: Record<string, string> = {};
          if (checkIn && checkIn !== 'all') params.checkIn = checkIn;
          if (q) params.q = q;
          return (
            await apiClient.get<Paged<Attendee>>(
              `/public-event/organizer/${eventId}/attendees`,
              { params },
            )
          ).data;
        }),
      providesTags: (_r, _e, { eventId }) => [
        { type: 'PublicEventAttendees' as const, id: eventId },
      ],
    }),

    checkInTicket: build.mutation<
      CheckInOutcome,
      { eventId: string; qrToken?: string | undefined; code?: string | undefined }
    >({
      queryFn: ({ eventId, qrToken, code }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.post<CheckInOutcome>(
                `/public-event/organizer/${eventId}/check-in`,
                qrToken ? { qrToken } : { code },
              )
            ).data,
        ),
      /* The scan is the one action that changes who is in the room, so the
         attendee list and the dashboard both go stale the moment it lands. */
      invalidatesTags: (_r, _e, { eventId }) => [
        { type: 'PublicEventAttendees' as const, id: eventId },
        { type: 'PublicEventDashboard' as const, id: eventId },
      ],
    }),

    // ----- Memories and the stream -----

    setEventMemories: build.mutation<
      EventMemoriesSettings,
      { eventId: string; body: Partial<EventMemoriesSettings> }
    >({
      queryFn: ({ eventId, body }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.patch<EventMemoriesSettings>(
                `/public-event/organizer/${eventId}/memories`,
                body,
              )
            ).data,
        ),
      invalidatesTags: (_r, _e, { eventId }) => [
        { type: 'PublicEvent' as const, id: eventId },
        { type: 'PublicEventDashboard' as const, id: eventId },
      ],
    }),

    setEventLiveStream: build.mutation<
      EventLiveSettings & { state: string },
      { eventId: string; body: Partial<EventLiveSettings> }
    >({
      queryFn: ({ eventId, body }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.patch<EventLiveSettings & { state: string }>(
                `/public-event/organizer/${eventId}/live-stream`,
                body,
              )
            ).data,
        ),
      invalidatesTags: (_r, _e, { eventId }) => [
        { type: 'PublicEvent' as const, id: eventId },
        { type: 'PublicEventDashboard' as const, id: eventId },
      ],
    }),
  }),
});

export const {
  useGetPublicEventsQuery,
  useGetPublicEventQuery,
  useCreatePublicEventMutation,
  useUpdatePublicEventMutation,
  useSetPublicEventStatusMutation,
  useGetTicketTypesQuery,
  useCreateTicketTypeMutation,
  useUpdateTicketTypeMutation,
  useArchiveTicketTypeMutation,
  useGetEventDashboardQuery,
  useGetAttendeesQuery,
  useCheckInTicketMutation,
  useSetEventMemoriesMutation,
  useSetEventLiveStreamMutation,
} = organizerPublicEventsApi;
