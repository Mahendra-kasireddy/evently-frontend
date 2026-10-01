import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@shared/components';
import {
  EVENT_STATUS_LABEL,
  EVENT_STATUS_TONE,
  LIST_FILTERS,
  formatInZone,
  formatMoney,
} from './constants';
import { EventForm } from './EventForm';
import type { PublicEventInput, PublicEventStatus, PublicEventSummary } from './types';
import s from './styles.module.css';

interface ComponentProps {
  events: PublicEventSummary[];
  filter: PublicEventStatus | 'all';
  onFilter: (filter: PublicEventStatus | 'all') => void;
  search: string;
  onSearch: (value: string) => void;
  isFetching: boolean;
  isCreating: boolean;
  createError: string | null;
  onCreate: (body: PublicEventInput) => Promise<unknown>;
}

/**
 * The organizer's public events.
 *
 * Each row carries its own numbers — sold, left, and what a ticket starts at —
 * because the question an organizer opens this list with is "how is it going",
 * and a list of names makes them open every event to find out.
 */
export function Component({
  events,
  filter,
  onFilter,
  search,
  onSearch,
  isFetching,
  isCreating,
  createError,
  onCreate,
}: ComponentProps) {
  const [creating, setCreating] = useState(false);

  if (creating) {
    return (
      <section className={s.screen}>
        <header className={s.pageHead}>
          <h2 className={s.pageTitle}>New public event</h2>
          <p className={s.pageHint}>
            It starts as a draft. Nobody sees it until you add a ticket type and publish it.
          </p>
        </header>
        <EventForm
          event={null}
          busy={isCreating}
          error={createError}
          onCancel={() => setCreating(false)}
          onSubmit={async (body) => {
            await onCreate(body);
            setCreating(false);
          }}
        />
      </section>
    );
  }

  return (
    <section className={s.screen}>
      <header className={s.toolbar}>
        <div className={s.filters} role="tablist" aria-label="Filter events by status">
          {LIST_FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={filter === item.key}
              className={filter === item.key ? s.filterOn : s.filter}
              onClick={() => onFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={s.toolbarRight}>
          <input
            className={s.search}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by name"
            aria-label="Search your events by name"
          />
          <button type="button" className={s.primaryBtn} onClick={() => setCreating(true)}>
            New event
          </button>
        </div>
      </header>

      {events.length === 0 ? (
        <EmptyState
          title={filter === 'all' ? 'No public events yet' : 'Nothing here'}
          message={
            filter === 'all'
              ? 'A public event is one you sell tickets to. Create one, add its ticket types, then publish it.'
              : 'No events with this status. Try another filter.'
          }
        />
      ) : (
        <ul className={s.grid} aria-busy={isFetching}>
          {events.map((event) => (
            <li key={event.id} className={s.card}>
              <Link className={s.cardLink} to={`/organizer/public-events/${event.id}`}>
                <div className={s.cover}>
                  {event.coverUrl ? (
                    <img className={s.coverImg} src={event.coverUrl} alt="" loading="lazy" />
                  ) : (
                    <div className={s.coverBlank} aria-hidden="true" />
                  )}
                  <span className={`${s.status} ${s[EVENT_STATUS_TONE[event.status]]}`}>
                    {EVENT_STATUS_LABEL[event.status]}
                  </span>
                </div>

                <div className={s.cardBody}>
                  <h3 className={s.cardTitle}>{event.title}</h3>
                  <p className={s.cardWhen}>
                    {formatInZone(event.startDateTime, event.timezone)}
                    {event.venue?.city ? ` · ${event.venue.city}` : ''}
                  </p>

                  {/*
                    An event with no ticket types is unfinished, and saying
                    "0 sold" about it reports a number instead of the problem.
                  */}
                  {event.ticketTypeCount === 0 ? (
                    <p className={s.cardWarn}>No ticket types yet — add one before publishing.</p>
                  ) : (
                    <dl className={s.cardStats}>
                      <div className={s.stat}>
                        <dt className={s.statLabel}>Sold</dt>
                        <dd className={s.statValue}>{event.sold}</dd>
                      </div>
                      <div className={s.stat}>
                        <dt className={s.statLabel}>Left</dt>
                        <dd className={s.statValue}>{event.remaining}</dd>
                      </div>
                      <div className={s.stat}>
                        <dt className={s.statLabel}>From</dt>
                        <dd className={s.statValue}>{formatMoney(event.startingPrice)}</dd>
                      </div>
                    </dl>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Component;
