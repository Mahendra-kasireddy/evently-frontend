import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EVENT_STATUS_LABEL, EVENT_STATUS_TONE, formatInZone } from './constants';
import { EventForm } from './EventForm';
import {
  Attendees,
  CheckInPanel,
  DashboardTiles,
  LivePanel,
  MemoriesPanel,
  TicketTypes,
} from './sections';
import type { usePublicEventWorkspace } from './hooks/usePublicEventWorkspace';
import type { PublicEvent, PublicEventStatus } from './types';
import s from './styles.module.css';

type Workspace = ReturnType<typeof usePublicEventWorkspace>;

type Tab = 'dashboard' | 'details' | 'tickets' | 'attendees' | 'door' | 'memories' | 'live';

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'details', label: 'Details' },
  { key: 'tickets', label: 'Tickets' },
  { key: 'attendees', label: 'Attendees' },
  { key: 'door', label: 'Check-in' },
  { key: 'memories', label: 'Memories' },
  { key: 'live', label: 'Live stream' },
];

/**
 * What the organizer may move this event to from where it is.
 *
 * The same table the server keeps, mirrored here so the buttons offered are
 * the ones that will work. The server's copy is the one that decides — this
 * only keeps the screen from offering a move it will then refuse.
 */
function nextStatuses(status: PublicEventStatus): PublicEventStatus[] {
  switch (status) {
    case 'draft':
      return ['published', 'cancelled'];
    case 'published':
    case 'sold_out':
      return ['draft', 'completed', 'cancelled'];
    default:
      return [];
  }
}

const ACTION_LABEL: Record<string, string> = {
  published: 'Publish',
  draft: 'Unpublish',
  completed: 'Mark completed',
  cancelled: 'Cancel event',
};

export function EventWorkspace({ event, ws }: { event: PublicEvent; ws: Workspace }) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const canEdit = event.status !== 'completed' && event.status !== 'cancelled';

  const move = async (status: PublicEventStatus) => {
    if (status === 'cancelled') {
      const reason = window.prompt(
        'Cancelling closes sales and tells your attendees. What should they be told?',
        '',
      );
      if (reason === null) return;
      await ws.changeStatus(status, reason);
      return;
    }
    await ws.changeStatus(status);
  };

  return (
    <section className={s.screen}>
      <header className={s.eventHead}>
        <div>
          <Link className={s.backLink} to="/organizer/public-events">
            ← All public events
          </Link>
          <h2 className={s.pageTitle}>{event.title}</h2>
          <p className={s.pageHint}>
            {formatInZone(event.startDateTime, event.timezone)}
            {event.venue?.name ? ` · ${event.venue.name}` : ''}
          </p>
        </div>

        <div className={s.headActions}>
          <span className={`${s.status} ${s[EVENT_STATUS_TONE[event.status]]}`}>
            {EVENT_STATUS_LABEL[event.status]}
          </span>
          {nextStatuses(event.status).map((status) => (
            <button
              key={status}
              type="button"
              className={status === 'published' ? s.primaryBtn : s.ghostBtn}
              disabled={ws.isChangingStatus}
              onClick={() => void move(status)}
            >
              {ACTION_LABEL[status]}
            </button>
          ))}
        </div>
      </header>

      {ws.statusError ? <p className={s.error}>{ws.statusError}</p> : null}
      {event.status === 'cancelled' && event.cancelReason ? (
        <p className={s.notice}>Cancelled: {event.cancelReason}</p>
      ) : null}

      <nav className={s.tabs} role="tablist" aria-label="Event sections">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            className={tab === item.key ? s.tabOn : s.tab}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === 'dashboard' ? (
        ws.dashboard ? (
          <DashboardTiles data={ws.dashboard} />
        ) : (
          <p className={s.hint}>Counting…</p>
        )
      ) : null}

      {tab === 'details' ? (
        canEdit ? (
          <EventForm
            event={event}
            busy={ws.isSavingEvent}
            error={ws.saveEventError}
            onCancel={() => setTab('dashboard')}
            onSubmit={(body) => ws.saveEvent(body)}
          />
        ) : (
          <p className={s.hint}>
            A {event.status} event is a record of something that happened, so its details are no
            longer editable.
          </p>
        )
      ) : null}

      {tab === 'tickets' ? (
        <TicketTypes
          types={ws.ticketTypes}
          busy={ws.isSavingTicket}
          error={ws.ticketError}
          canEdit={canEdit}
          onCreate={ws.addTicketType}
          onUpdate={ws.editTicketType}
          onArchive={ws.removeTicketType}
        />
      ) : null}

      {tab === 'attendees' ? (
        <Attendees
          rows={ws.attendees}
          total={ws.attendeeTotal}
          filter={ws.attendeeFilter}
          onFilter={ws.setAttendeeFilter}
          search={ws.attendeeSearch}
          onSearch={ws.setAttendeeSearch}
          busy={ws.attendeesLoading}
        />
      ) : null}

      {tab === 'door' ? (
        <CheckInPanel
          open={event.status === 'published' || event.status === 'sold_out' || event.status === 'completed'}
          busy={ws.isScanning}
          last={ws.lastScan}
          onScan={ws.scan}
          onClear={ws.clearScan}
        />
      ) : null}

      {tab === 'memories' ? (
        <MemoriesPanel
          settings={event.memories}
          busy={ws.isSavingMemories}
          onChange={ws.saveMemories}
        />
      ) : null}

      {tab === 'live' ? (
        <LivePanel
          settings={event.liveStream}
          state={ws.dashboard?.liveState ?? 'upcoming'}
          busy={ws.isSavingLive}
          error={ws.liveError}
          onChange={ws.saveLiveStream}
        />
      ) : null}
    </section>
  );
}

export default EventWorkspace;
