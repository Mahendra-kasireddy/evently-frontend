import { formatMoney } from '../constants';
import type { Attendee } from '../types';
import s from '../styles.module.css';

interface AttendeesProps {
  rows: Attendee[];
  total: number;
  filter: 'all' | 'checked_in' | 'pending';
  onFilter: (value: 'all' | 'checked_in' | 'pending') => void;
  search: string;
  onSearch: (value: string) => void;
  busy: boolean;
}

const FILTERS: Array<{ key: 'all' | 'checked_in' | 'pending'; label: string }> = [
  { key: 'all', label: 'Everyone' },
  { key: 'pending', label: 'Yet to arrive' },
  { key: 'checked_in', label: 'Checked in' },
];

/**
 * Who is coming — one row per seat.
 *
 * Per ticket rather than per booking, because four seats bought together are
 * four people at the door who arrive separately.
 *
 * What is deliberately not on this screen: the QR token, which the server does
 * not return to anybody but the ticket's own holder, and anything about how the
 * customer paid beyond whether they did. An organizer needs to know a booking
 * is settled; they have no business with the instrument.
 */
export function Attendees({
  rows,
  total,
  filter,
  onFilter,
  search,
  onSearch,
  busy,
}: AttendeesProps) {
  return (
    <div className={s.panel}>
      <div className={s.toolbar}>
        <div className={s.filters} role="tablist" aria-label="Filter attendees">
          {FILTERS.map((item) => (
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
        <input
          className={s.search}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Name, email, phone or code"
          aria-label="Search attendees"
        />
      </div>

      {rows.length === 0 ? (
        <p className={s.hint}>
          {busy ? 'Looking…' : 'Nobody here yet. Attendees appear as tickets are bought.'}
        </p>
      ) : (
        <table className={s.table} aria-busy={busy}>
          <caption className={s.tableCaption}>
            {rows.length} of {total} {total === 1 ? 'ticket' : 'tickets'}
          </caption>
          <thead>
            <tr>
              <th scope="col">Attendee</th>
              <th scope="col">Ticket</th>
              <th scope="col">Code</th>
              <th scope="col">Booking</th>
              <th scope="col">Payment</th>
              <th scope="col">Entry</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.ticketId}>
                <td>
                  <strong>{row.customerName || 'Guest'}</strong>
                  {row.customerEmail ? <div className={s.cellHint}>{row.customerEmail}</div> : null}
                  {row.customerPhone ? <div className={s.cellHint}>{row.customerPhone}</div> : null}
                </td>
                <td>
                  {row.ticketTypeName}
                  <div className={s.cellHint}>{formatMoney(row.amount)}</div>
                </td>
                <td>
                  <code className={s.code}>{row.code}</code>
                </td>
                <td>
                  {row.bookingReference}
                  <div className={s.cellHint}>{row.bookingStatus}</div>
                </td>
                <td>
                  <span className={row.paymentStatus === 'paid' ? s.pillOn : s.pillOff}>
                    {row.paymentStatus || 'pending'}
                  </span>
                </td>
                <td>
                  {row.status === 'checked_in' ? (
                    <span className={s.pillOn}>Checked in</span>
                  ) : (
                    <span className={s.pillOff}>Not yet</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Attendees;
